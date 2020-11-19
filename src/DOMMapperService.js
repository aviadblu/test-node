class DOMMapperService {
    constructor() {
        // this.LISTEN_DOM_EVENTS = [
        //     "change", "click", "close",
        //     "dbclick", "drag", "drop",
        //     "input",
        //     "keyup", "reset", "resize", "select"];

        this.ATTR_LIST = ["id", "name", "class", "type"];

        this.INNER_TXT_LIMIT = 50;
        this.VALUE_TXT_LIMIT = 30;
    }

    ExtractDOMElementSignature(htmlElement) {
        let signature = {};
        signature.tagName = htmlElement.tagName;
        const attrList = htmlElement.attributes;
        signature.attrMap = {};
        for (let i = 0; i < attrList.length; i++) {
            if (this.ATTR_LIST.indexOf(attrList[i].nodeName) > -1) {
                signature.attrMap[attrList[i].nodeName] = attrList[i].nodeValue;
            }
        }
        signature.elementIndex = this.GetDomElementIndex(htmlElement, signature.tagName);
        signature.txt = this.GetElementTxt(htmlElement);
        signature.value = htmlElement.value ? htmlElement.value.substring(0, this.VALUE_TXT_LIMIT) : "";
        return signature;
    }

    GetDomElementIndex(htmlElement, tagName) {
        const tagList = document.getElementsByTagName(tagName);
        for (let i = 0; i < tagList.length; i++) {
            if (tagList[i] === htmlElement) {
                return i;
            }
        }
        return -1;
    }

    GetElementTxt(htmlElement) {
        // limited to 20 chars
        let txt = htmlElement.innerText;
        if (txt === "") {
            txt = htmlElement.innerHTML;
        }
        return txt.substring(0, this.INNER_TXT_LIMIT);
    }


    GetElementBySignature(signature) {
        const DOMElementsList = document.getElementsByTagName(signature.tagName);
        let elementsList = [];
        for (let i = 0; i < DOMElementsList.length; i++) {
            elementsList.push({
                htmlElement: DOMElementsList[i],
                signature: this.ExtractDOMElementSignature(DOMElementsList[i]),
                matchScore: 0
            })
        }

        if (elementsList.length === 0) throw `Could not find element with tag ${signature.tagName}`;
        // for one element return it
        if (elementsList.length === 1) return elementsList[0].htmlElement;

        //////////////////////
        // Matching
        //////////////////////

        // happy path (target not changed)
        const elementSignStr = JSON.stringify(signature);
        for (let i = 0; i < elementsList.length; i++) {
            let currentElSignature = JSON.stringify(elementsList[i].signature);
            if (elementSignStr === currentElSignature) {
                return elementsList[i].htmlElement;
            }
        }

        // attributes matching
        const searchAttrKeys = Object.keys(signature.attrMap);
        for (let i = 0; i < elementsList.length; i++) {
            const candidateElementAttr = elementsList[i].signature.attrMap;
            searchAttrKeys.forEach(searchForAttrKey => {
                if (candidateElementAttr.hasOwnProperty(searchForAttrKey) && candidateElementAttr[searchForAttrKey] === signature.attrMap[searchForAttrKey]) {
                    elementsList[i].matchScore += 5;
                } else {
                    elementsList[i].matchScore -= 10;
                }
            });
        }

        // text matching
        if (signature.txt !== "") {
            for (let i = 0; i < elementsList.length; i++) {
                if (signature.txt === elementsList[i].signature.txt) {
                    elementsList[i].matchScore += 4;
                } else {
                    elementsList[i].matchScore -= 2;
                }
            }
        }

        // value matching
        if (signature.value !== "") {
            for (let i = 0; i < elementsList.length; i++) {
                if (signature.value === elementsList[i].signature.value) {
                    elementsList[i].matchScore += 4;
                } else {
                    elementsList[i].matchScore -= 2;
                }
            }
        }

        let highestScoreElement = elementsList[0];
        for (let i = 0; i < elementsList.length; i++) {
            if (elementsList[i].matchScore > highestScoreElement.matchScore) {
                highestScoreElement = elementsList[i];
            }
        }

        if (highestScoreElement.matchScore < 0) {
            throw `Element not found ${JSON.stringify(signature)}`;
        }

        return highestScoreElement.htmlElement;
    }

}
