const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { hash } = require("../src/helpers");

test.describe("Origin id", () => {
  const FOO_ID = "foo-id";
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("Without query", () => {
    test.describe("without default value", () => {
      test.it("private property _id should be equal to given id", () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID);
        test.expect(testOrigin._id).to.equal(FOO_ID);
      });

      test.it("private property _uniqueId should be the hash of given id and undefined", () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID);
        test.expect(testOrigin._uniqueId).to.equal(hash(`${FOO_ID}${undefined}`));
      });
    });

    test.describe("with default value", () => {
      test.it(
        "private property _uniqueId should be the hash of given id and given default value",
        () => {
          const TestOrigin = class extends Origin {};
          const testOrigin = new TestOrigin(FOO_ID, []);
          test.expect(testOrigin._uniqueId).to.equal(hash(`${FOO_ID}${JSON.stringify([])}`));
        }
      );
    });
  });

  test.describe("With query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the queryId",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID).query({
          foo: "foo-query"
        });
        test.expect(testOrigin._id).to.equal(`${FOO_ID}-{"foo":"foo-query"}`);
      }
    );

    test.it(
      "private property _uniqueId should be the hash of root _uniqueId and given query",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID, []).query({
          foo: "foo-query"
        });
        test.expect(testOrigin._uniqueId).to.equal(
          hash(
            `${hash(`${FOO_ID}${JSON.stringify([])}`)}${JSON.stringify({
              foo: "foo-query"
            })}`
          )
        );
      }
    );
  });

  test.describe("With chained query", () => {
    test.it(
      "private property _id should be equal to the combination of given id and the extension of the queries ids",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID)
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test.expect(testOrigin._id).to.equal(`${FOO_ID}-{"foo":"foo-query","foo2":"foo-query-2"}`);
      }
    );

    test.it(
      "private property _uniqueId should be equal to the combination of root _uniqueId and the extension of the queries ids",
      () => {
        const TestOrigin = class extends Origin {};
        const testOrigin = new TestOrigin(FOO_ID, [])
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test.expect(testOrigin._uniqueId).to.equal(
          hash(
            `${hash(`${FOO_ID}${JSON.stringify([])}`)}${JSON.stringify({
              foo: "foo-query",
              foo2: "foo-query-2"
            })}`
          )
        );
      }
    );
  });
});
