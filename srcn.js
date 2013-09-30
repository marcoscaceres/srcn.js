(function ProcessingModel(global) {
    'use strict';

    var startsWithSrc = /^src/i,
        is1To10 = /[1-9]/,
        isDigits = /^\d+$/,
        mqRegex = /^\s*\([^\)]*\)(\s+and\s+\([^\)]*\))*\s+/;

    window.addEventListener('DOMContentLoaded', processImgElements);

    function processImgElements() {
        var imgs = global.document.querySelectorAll('img');
        Array.prototype.forEach.call(imgs, function (elem) {
            console.log('finding candigates for:', elem);
            console.log(obtainCandidates(elem));
        });
    }

    function obtainCandidates(element) {
        var candiateAttrs = findCandidates(element.attributes);

        //Let candidate attributes be the list of attributes on
        //the element who satisfy the following conditions:

        function findCandidates(attrs) {
            var matches = [];

            for (var i = 0, name; i < attrs.length; i++) {
                name = attrs[i].name;
                //The attribute name is at least 4 characters long.
                if (name.length < 4) {
                    continue;
                }
                //The first three characters of the attribute name are
                //an ASCII case-insensitive match for "src".
                if (!startsWithSrc.test(name)) {
                    continue;
                }
                //The fourth character of the attribute name is a non-zero digit (1-9).
                if (!is1To10.test(name[3])) {
                    continue;
                }
                //The remaining characters of the attribute name are digits (0-9).
                if (!isDigits.test(name.substring(3, name.length))) {
                    continue;
                }
                //The attribute value matches the <srcn-attribute> production.
                if (!isValidSrcn(attrs[i].value)) {
                    continue;
                }
                matches.push(attrs[i]);
            }
            return matches;
        }

        function isValidSrcn() {
            console.log('isValidSrcn() - NOT IMPLEMENTED YET');
            return true;
        }

        //If candidate attributes is empty, return the result of obtaining
        //a candidate from src from the element and abort this algorithm.
        if (candiateAttrs.length === 0) {
            return obtainCandidateFromSrc(element);
        }

        //For each candidate attribute, let its index be the result of
        //removing the first three characters from the attribute name,
        //and interpreting the remaining characters as a base-10 number.

        function sortByIndex(a, b) {
            var aIndex = parseInt(a.name.substring(3, a.name.length), 10);
            var bIndex = parseInt(b.name.substring(3, b.name.length), 10);
            if (aIndex < bIndex) {
                return -1;
            }
            if (aIndex > bIndex) {
                return 1;
            }
            return 0;
        }

        //Sort the candidate attributes by their index in ascending order.
        candiateAttrs.sort(sortByIndex);

        //For each candidate attribute:
        for (var i = 0, value = '', query = '', matchedQuery, winningValue; i < candiateAttrs.length; i++) {
            value = candiateAttrs[i].value;

            //If the attribute’s value contains a media query, evaluate that query.
            if (mqRegex.test(value)) {
                query = value.match(mqRegex)[0];
                matchedQuery = window.matchMedia(query);

                if (matchedQuery.matches) {
                    //If it returns true, let winning value be the value of this attribute
                    //following the media query and abort this sub-algorithm.
                    winningValue = value.substring(value.indexOf(query) + query.length, value.length);
                    break;
                } else {
                    //Otherwise, if it returns false, abort this sub-algorithm.
                    break;
                }
            }
            //Otherwise, let winning value be this attribute’s value and abort this sub-algorithm.
            winningValue = value;
        }

        if (winningValue === undefined) {
            //If there is no winning value, return the result of obtaining a candidate
            //from src from the element and abort this algorithm.
            return obtainCandidateFromSrc(element);
        }

        //Let image candidates be an initially empty list.
        var imageCandidates = [];

        //If the winning value conforms to the <x-based-urls> production,
        //then for each set of values between commas:
        //Let candidate be an image candidate with its url being the <url>
        //from the current set of values.
        //If the current set of values contains a <resolution>,
        //let candidate’s resolution be that resolution.
        //Otherwise, let candidate’s resolution be 1x.
        //Append candidate to image candidates.

        //Return image candidates, and abort this algorithm.
        //Otherwise, the winning value conforms to the <viewport-urls> production.
        //Let viewport data be the portion of winning value that conforms to
        //the <size-viewport-list> production. Let unprocessed candidates
        //be the portion of the winning value that conforms to
        //the <size-based-urls> production.
        //Divide viewport data into adjacent pairs of values, and a final lone value.

        //For each pair of values in viewport data:
        //Let candidate viewport width be the result of intepreting the second value as a <length>, using the same rules as a <length> in a max-width media feature.
        //If the viewport’s width is less than or equal to candidate viewport width, then:

        //If the first value is a <number>, let winning image width be a length equal to that number of pixels.
        //Otherwise, the first value is a <percentage>. Let winning image width be a length equal to the given percentage of the viewport’s width.

        //Abort this sub-algorithm.
        //For each set of values between commas of unprocessed candidates:
        //Let candidate be an image candidate with its url being the <url> from the current set of values.
        //Let candidate’s resolution be the result of dividing the <integer> from the current set of values by the winning image width, as an x unit.
        //Append candidate to image candidates.

        //Return image candidates.
        return imageCandidates;

        //To obtain a candidate from src from an element, follow these steps:
        function obtainCandidateFromSrc(elem) {
            var candidates = [],
                imgCandidate;
            //If the element has a src attribute, return a list consisting of a single image candidate,
            //where that candidate’s url is the value of the src attribute and its resolution is 1x.
            if (elem.hasAttribute('src')) {
                imgCandidate = new ImageCandidate(elem.getAttribute('src'), '1x');
                candidates.push(imgCandidate);
            }
            //Otherwise, return an empty list.
            return candidates;
        }

        function ImageCandidate(url, resolution) {
            this.ulr = url;
            this.resolution = resolution;
        }
    }
    Object.defineProperty(global, 'getImageCandidates', {
        value: function (element) {
            return obtainCandidates(element);
        }
    });
}(this));