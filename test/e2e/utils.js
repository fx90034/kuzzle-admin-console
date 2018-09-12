const BlinkDiff = require('blink-diff')
const path = require('path')
const fs = require('fs')
const paths = {
  base: 'visual-regression',
  reference: 'reference',
  current: 'current',
  diff: 'diff'
}
const threshold = 0.01
const cloudinary = require('cloudinary')

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name || 'kuzzle',
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret
})

const sendToCloudinary = (path, publicId) => {
  cloudinary.v2.uploader.upload(path, {
    public_id: publicId,
    tags: ['kuzzle-admin-console']
  })
}

const getCurrentScreenshotPath = name => {
  return path.join(paths.base, paths.current, name + '.png')
}

const compareScreenshot = async name => {
  const currentScreenshotPath = getCurrentScreenshotPath(name)
  const referenceScreenshotPath = path.join(
    paths.base,
    paths.reference,
    name + '.png'
  )
  const diffScreenshotPath = path.join(paths.base, paths.diff, name + '.png')

  if (!fs.existsSync(referenceScreenshotPath)) {
    if (process.env.updatingVisualReference) {
      return true
    }
    throw new Error(
      `Missing reference for screenshot ${name}. Did you run "npm run e2e-update-reference" ?`
    )
  }

  const diff = new BlinkDiff({
    imageAPath: referenceScreenshotPath,
    imageBPath: currentScreenshotPath,
    thresholdType: BlinkDiff.THRESHOLD_PERCENT,
    threshold,
    imageOutputPath: diffScreenshotPath,
    composition: false
  })

  const diffResult = await diff.runWithPromise()

  if (diffResult.code === 1) {
    throw new Error(
      `Screenshot differences are over the threshold: ${diffResult.differences}`
    )
  }
}

module.exports = {
  getCurrentScreenshotPath,
  compareScreenshot,
  visualRegressionPaths: paths,
  sendToCloudinary
}
