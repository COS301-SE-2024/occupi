// import { setupServer } from 'msw/node';
// import { rest } from 'msw';

// const server = setupServer(
//   rest.get('/api/get-users', (req, res, ctx) => {
//     return res(
//       ctx.status(200),
//       ctx.json({ users: [] })
//     );
//   })
// );

// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
