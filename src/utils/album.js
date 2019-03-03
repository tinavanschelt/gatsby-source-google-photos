import axios from 'axios'

const getAlbums = async (baseUrl, headers, pageToken) => {
  const url = pageToken
    ? `${baseUrl}/albums?pageSize=50&pageToken=${pageToken}`
    : `${baseUrl}/albums?pageSize=50`
  const response = await axios.get(url, headers)
  return response.data
}

const getAlbumData = (albums, albumTitle) =>
  albums.filter(album => album.title === albumTitle)

const getAlbumId = async (baseUrl, headers, albumTitle) => {
  const { albums, nextPageToken } = await getAlbums(baseUrl, headers)
  let album = getAlbumData(albums, albumTitle)
  let pageToken = nextPageToken

  if (album.length > 0) {
    return album[0].id
  } else {
    while (album.length < 1) {
      const { albums, nextPageToken } = await getAlbums(
        baseUrl,
        headers,
        pageToken
      )
      const album = getAlbumData(albums, albumTitle)
      pageToken = nextPageToken

      if (album.length > 0) {
        return album[0].id
        break
      }

      if (pageToken === undefined) {
        break
      }
    }
  }
}

export default { getAlbums, getAlbumData, getAlbumId }
