import { makeInvalidToken, makeTestUsers, resetTestState } from './testUtil';
import { reqUserProfile, reqUserProfileUploadPhoto } from './testWrappers';
import request from 'sync-request';

beforeEach(resetTestState);
afterAll(resetTestState);

/**
 * Return a URL to a test image
 */
const makeTestImageURL = (height: number, width: number) => {
  // adorable test images!
  return `http://placekitten.com/${width}/${height}`;
};

describe('user/profile/uploadphoto', () => {
  describe('error cases', () => {
    test.each([
      { xStart: -1, yStart: 0, xEnd: 400, yEnd: 400 },
      { xStart: 0, yStart: -1, xEnd: 400, yEnd: 400 },
      { xStart: 0, yStart: 0, xEnd: 501, yEnd: 400 },
      { xStart: 0, yStart: 0, xEnd: 400, yEnd: 501 },
      { xStart: 300, yStart: 100, xEnd: 300, yEnd: 400 },
      { xStart: 100, yStart: 300, xEnd: 400, yEnd: 300 },
      { xStart: 400, yStart: 100, xEnd: 100, yEnd: 400 },
      { xStart: 100, yStart: 400, xEnd: 400, yEnd: 100 },
    ])(
      'invalid coords: xStart = $xStart, yStart = $yStart, xEnd = $xEnd, yEnd = $yEnd',
      ({ xStart, yStart, xEnd, yEnd }) => {
        const users = makeTestUsers();
        reqUserProfileUploadPhoto({
          token: users.token1,
          imgUrl: makeTestImageURL(500, 500),
          xStart,
          yStart,
          xEnd,
          yEnd
        });
      }
    );

    test.each([
      { url: 'http://example.com/this-is-not-valid.jpg' },
      { url: 'http://gifpng.com/500x500.png' },
      { url: 'http://example.com/' },
      { url: 'http://invalid.domainwow/image.jpg' },
      { url: 'justrandomstuff' },
      { url: 'ssh://example.com/wrong-protcol' },
      { url: 'https://httpstat.us/500' },
    ])('invalid image: uploadPhoto("$url")', ({ url }) => {
      const users = makeTestUsers();

      expect(reqUserProfileUploadPhoto({
        token: users.token1,
        imgUrl: url,
        xStart: 0,
        yStart: 0,
        xEnd: 100,
        yEnd: 100
      })).toStrictEqual(400);
    });

    test('invalid token', () => {
      makeTestUsers();

      expect(reqUserProfileUploadPhoto({
        token: makeInvalidToken(),
        imgUrl: makeTestImageURL(500, 500),
        xStart: 100,
        yStart: 100,
        xEnd: 300,
        yEnd: 300
      })).toStrictEqual(403);
    });
  });

  describe('success', () => {
    test('changes from default', () => {
      const users = makeTestUsers();

      const oldUrl = reqUserProfile({
        token: users.token2, uId: users.uId1
      }).user.profileImgUrl;

      const oldImage = request('GET', oldUrl, {}).body;

      expect(oldImage).toStrictEqual(oldImage);

      expect(reqUserProfileUploadPhoto({
        token: users.token1,
        imgUrl: makeTestImageURL(500, 500),
        xStart: 10,
        yStart: 10,
        xEnd: 490,
        yEnd: 490
      })).toStrictEqual({});

      const newUrl = reqUserProfile({
        token: users.token2, uId: users.uId1
      }).user.profileImgUrl;

      const newImage = request('GET', newUrl, {}).body;

      // check profile has actually changed
      expect(oldImage).not.toStrictEqual(newImage);
    });

    test('cropping changes image', () => {
      const users = makeTestUsers();

      expect(reqUserProfileUploadPhoto({
        token: users.token1,
        imgUrl: makeTestImageURL(500, 500),
        xStart: 0,
        yStart: 0,
        xEnd: 499,
        yEnd: 499
      })).toStrictEqual({});

      const oldUrl = reqUserProfile({
        token: users.token2, uId: users.uId1
      }).user.profileImgUrl;
      const oldImage = request('GET', oldUrl, {}).body;

      expect(oldImage).toStrictEqual(oldImage);

      expect(reqUserProfileUploadPhoto({
        token: users.token1,
        imgUrl: makeTestImageURL(500, 500),
        xStart: 250,
        yStart: 250,
        xEnd: 300,
        yEnd: 300
      })).toStrictEqual({});

      const newUrl = reqUserProfile({
        token: users.token2, uId: users.uId1
      }).user.profileImgUrl;

      const newImage = request('GET', newUrl, {}).body;

      // check profile has actually changed
      expect(oldImage).not.toStrictEqual(newImage);
    });
  });
});
