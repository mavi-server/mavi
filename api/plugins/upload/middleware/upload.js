const formidable = require('formidable')

module.exports = (req, res) => {
  if (req.params.folder) {
    const form = new formidable.IncomingForm()

    form.parse(req)

    form.on('fileBegin', function (name, file) {
      file.path = process.cwd() + `/static/${req.params.folder}/` + file.name
    })
    form.on('file', function (name, file) {
      console.log('file uploaded ', file.path)
      try {
        res.end(process.env.CLIENT_URL + `/static/${req.params.folder}/` + file.name)
      } catch (err) {
        console.error('upload error:', err.message)
      }
    })
  }
  return res.error('upload plugin: please define {folder: "name"}')
}