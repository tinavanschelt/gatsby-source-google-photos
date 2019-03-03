import { authGooglePhotos, checkAuth } from './auth.js'
import axios from 'axios'

import { getAlbumId } from './utils/album.js'
import { readToken } from './utils/token.js'
import { globalConst, error } from './config.js'

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  config
) => {
  const { createNode } = actions
  const { clientId, clientSecret, albums } = config

  if (clientId && clientSecret && albums) {
    const token = readToken()
    let res

    if (token) {
      res = await checkAuth(config, token)
    } else {
      res = await authGooglePhotos(config)
    }

    const headers = {
      headers: { Authorization: `Bearer ${res}` }
    }

    try {
      const processPhoto = (albumTitle, photo) => {
        let { id } = photo
        const photoData = Object.assign({ albumTitle }, photo)
        const nodeContent = JSON.stringify(photoData)
        const nodeData = Object.assign({}, photoData, {
          id: `${id}`,
          children: [],
          parent: null,
          internal: {
            type: 'GooglePhoto',
            content: nodeContent,
            contentDigest: createContentDigest(photoData)
          }
        })

        return nodeData
      }

      for (const albumTitle of albums) {
        const albumId = await getAlbumId(
          `${globalConst.baseUrl}`,
          headers,
          albumTitle
        )

        if (albumId === undefined) {
          throw `Cannot find album with title ${albumTitle}. Check you gatsby-config.js file.`
        } else {
          const albumMediaItems = await axios.post(
            `${globalConst.baseUrl}/mediaItems:search`,
            { albumId },
            headers
          )

          const { mediaItems } = albumMediaItems.data
          const photos = mediaItems.filter(
            item =>
              item.filename.indexOf('.mov') === -1 &&
              item.filename.indexOf('.m4v') === -1 &&
              item.filename.indexOf('.mp4') === -1 &&
              item.filename.indexOf('.avi') === -1
          )

          photos.forEach(photo => {
            const nodeData = processPhoto(albumTitle, photo)
            createNode(nodeData)
          })
        }
      }
    } catch (err) {
      console.log(error(`Error caught while creating node: `), err)
    }
  } else {
    throw `Please provide all the info for oauth2. See documentation.`
  }
}
