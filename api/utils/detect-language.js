// detect content language
// only supported for "content" column

import LanguageDetect from "languagedetect"
const lngDetector = new LanguageDetect();

export default (data, { schema }) => {
  if (data) {
    if (schema.find(c => c === 'content') && data.content != null) {
      // get part of the content for better performance
      const content = data.content.slice(0, 500)

      // node.js 1000 items processed in 1.277 secs (482 with a score > 0.2)
      const [[lng, precision]] = lngDetector.detect(content, 1)

      data.language = lng
    } else console.error("data or schema doesn't have a content!")
  } else console.error("data is not defined")
  return data
}