// // bun-test-extend.d.ts
// import '@testing-library/jest-dom/extend-expect';
// import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// declare module 'bun:test' {
//   export default interface Expect<T = unknown>
//     extends TestingLibraryMatchers<ReturnType<typeof expect.stringContaining>, T> {
//       [x: string]: any;
// }
// }