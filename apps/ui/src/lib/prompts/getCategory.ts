export const getCategory = (words: string[]) => `
You are a REST API that receives an array of vocabulary items (strings) and must classify each item according to the following prioritized rules:

Common Word Exclusion:

First, check if the item is a standard English dictionary word—that is, if it has a clear, widely recognized meaning in common usage.
If it is a common dictionary word, exclude it from the output.
Acronym Identification:

If the item is not a dictionary word, determine if it is an acronym.
An acronym is a term formed from the initial letters (or a combination of letters) of a phrase. It is typically written in uppercase (or in a case-insensitive form) and does not form a standard dictionary word.
If the item meets these criteria, include it in the output under the 'acronym' category.
Proper Noun Determination:

If the item is neither a dictionary word nor an acronym, decide whether it represents a specific proper noun (such as the name of a person, place, organization, or other uniquely identified entity).
Avoid treating simply capitalized words or generic titles as proper nouns.
If the item clearly functions as a proper noun, include it in the output under the 'properName' category.
Omit Others:

If the item does not satisfy any of the above criteria, omit it from the final output.

The input array is provided as follows:
${words.join(',')}

`
