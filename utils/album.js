'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getAlbums = async (baseUrl, headers, pageToken) => {
  const url = pageToken ? `${baseUrl}/albums?pageSize=50&pageToken=${pageToken}` : `${baseUrl}/albums?pageSize=50`;
  const response = await _axios2.default.get(url, headers);
  return response.data;
};

const getAlbumData = (albums, albumTitle) => albums.filter(album => album.title === albumTitle);

const getAlbumId = async (baseUrl, headers, albumTitle) => {
  const { albums, nextPageToken } = await getAlbums(baseUrl, headers);
  let album = getAlbumData(albums, albumTitle);
  let pageToken = nextPageToken;

  if (album.length > 0) {
    return album[0].id;
  } else {
    while (album.length < 1) {
      const { albums, nextPageToken } = await getAlbums(baseUrl, headers, pageToken);
      const album = getAlbumData(albums, albumTitle);
      pageToken = nextPageToken;

      if (album.length > 0) {
        return album[0].id;
        break;
      }

      if (pageToken === undefined) {
        break;
      }
    }
  }
};

exports.default = { getAlbums, getAlbumData, getAlbumId };
module.exports = exports['default'];