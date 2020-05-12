require('dotenv').config();

const fakeRequest = require('supertest');
const app = require('../server.js');

describe('app routes', () => {
  beforeAll(() => {
    // TODO: a
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
  });

  afterAll(() => {
    // TODO: ADD CLOSE DB SCRIPT
  });

  test('returns animals', async() => {

    const expectation = [
      {
        'id': 1,
        'name': 'bessie',
        'coolfactor': 3,
        'owner_id': 1
      },
      {
        'id': 2,
        'name': 'jumpy',
        'coolfactor': 4,
        'owner_id': 1
      },
      {
        'id': 3,
        'name': 'spot',
        'coolfactor': 10,
        'owner_id': 1
      }
    ];

    const data = await fakeRequest(app)
      .get('/animals')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
