import { authGooglePhotos, checkAuth } from "./auth.js"
import axios from "axios"
import colors from "colors"

import { getAlbumId } from "./utils/album.js"
import { readToken } from "./utils/token.js"
import { globalConst, colorsTheme } from "./config.js"

colors.setTheme(colorsTheme)

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
      headers: { Authorization: `Bearer ${res}` },
    }

    try {
      const processPhoto = (album, photo) => {
        let { id } = photo
        const photoData = Object.assign({ album }, photo)
        const nodeContent = JSON.stringify(photoData)
        const nodeData = Object.assign({}, photoData, {
          id: `${id}`,
          children: [],
          parent: null,
          internal: {
            type: "GooglePhoto",
            content: nodeContent,
            contentDigest: createContentDigest(photoData),
          },
        })

        return nodeData
      }

      for (const album of albums) {
        const albumId = await getAlbumId(
          `${globalConst.baseUrl}`,
          headers,
          album
        )

        if (albumId === undefined) {
          throw `Cannot find album with title ${album}. Check you gatsby-config.js file.`
        } else {
          const albumMediaItems = await axios.post(
            `${globalConst.baseUrl}/mediaItems:search`,
            { albumId },
            headers
          )

          const { mediaItems } = albumMediaItems.data
          const photos = mediaItems.filter(
            item =>
              item.filename.indexOf(".mov") === -1 &&
              item.filename.indexOf(".m4v") === -1 &&
              item.filename.indexOf(".mp4") === -1 &&
              item.filename.indexOf(".avi") === -1
          )

          photos.forEach(photo => {
            const nodeData = processPhoto(album, photo)
            createNode(nodeData)
          })
        }
      }
    } catch (err) {
      console.log(`Error caught while creating node: `.error, err)
    }
  } else {
    throw `Please provide all the info for oauth2. See documentation.`.error
  }
}
