const fs = require('fs'); //importing the file system module
const path = require('path'); //importing the path module, for easy work with paths

class Cyan {
    constructor(codes) {
        this.codes = codes;
    }

    parse(tokens) {
        const length = tokens.length;
        let position = 0;
        while (position < length) {
            const token = tokens[position];

            //if the token type is keyword and value is print
            if (token.type === "keyword" && token.value === "print") {
                //checking if the next token doesn't exist
                if (!tokens[position + 1]) {
                    return console.log('Unexpected end of line, expected string.');
                }

                //checking if the next token is a string
                let isString = tokens[position + 1].type === "string";
                if (!isString) {
                    return console.log(`Unexpected token ${token[position + 1]}, expected string.`);
                }

                //reaching here, we have a valid syntax
                console.log('\x1b[36m%s\x1b[0m', tokens[position + 1].value);

                //adding 2, because we also checked the token after print keyword
                position += 2;
            } else {
                //if didn't match any rules
                return console.log(`Unexpected token ${token.type}`);
            }
        }
    }

    tokenize() {
        const length = this.codes.length;
        let position = 0; //keeps track of the current position
        let tokens = [];
        const BUILT_IN_KEYWORDS = ["print"];

        //allowed characters for variable/keywords
        const varChars = ["_", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        while (position < length) {
            let currentChar = this.codes[position];

            //if current char is a space or new line, skip it
            if (currentChar === " " || currentChar === "\n") {
                position++;
                continue;
            } else if (currentChar === '"') {
                //if current char is a quote, it's a string
                let res = "";
                position++;
                while (this.codes[position] !== '"' && this.codes[position] !== '\n' && position < length) {
                    res += this.codes[position];
                    position++;
                }

                //if the loop ended and didn't find a closing quote, throw an error
                if (this.codes[position] !== '"') {
                    return {
                        error: 'Unterminated string',
                    }
                }
                position++;

                //adding the string to the tokens
                tokens.push({
                    type: "string",
                    value: res,
                });
            } else if (varChars.includes(currentChar)) {
                //adding the char to the string
                let res = currentChar;
                position++;

                while (varChars.includes(this.codes[position]) && position < length) {
                    res += this.codes[position];
                    position++;
                }

                //if the keyword is not a built in keyword, throw an error
                if (!BUILT_IN_KEYWORDS.includes(res)) {
                    return {
                        error: `Unexpected token ${res}`,
                    }
                }

                //adding the keyword to the tokens
                tokens.push({
                    type: "keyword",
                    value: res,
                });
            } else {
                //throw an error for invalid character in the code
                return {
                    error: `Unexpected character ${this.codes[position]}`,
                }
            }
        }

        //return the tokens
        return {
            error: false,
            tokens
        }
    }

    run() {
        const {
            tokens,
            error
        } = this.tokenize();

        if (error) {
            console.log(error);
            return;
        }

        console.log(tokens);
        this.parse(tokens);
    }
}

//some editors use \r\n for new lines, so we need to remove the \r
const codes = fs.readFileSync(path.join(__dirname, 'test.cyan'), 'utf8').toString().replace(/\r/g);
const cyan = new Cyan(codes);
cyan.run();
