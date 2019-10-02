const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const helpers = require("../src/helpers");

test.describe("Origin id", () => {
  const FOO_ID = "foo-id";
  let sandbox;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId");
    sandbox.stub(helpers, "queriedUniqueId");
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

      test.it("private property _uniqueId should be calculated using id and default value", () => {
        const TestOrigin = class extends Origin {};
        new TestOrigin(FOO_ID);
        test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, undefined);
      });
    });

    test.describe("with default value", () => {
      test.it(
        "private property _uniqueId should be calculated based on given id and given default value",
        () => {
          const TestOrigin = class extends Origin {};
          new TestOrigin(FOO_ID, []);
          test.expect(helpers.uniqueId).to.have.been.calledWith(FOO_ID, []);
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
      "private property _uniqueId should be the calculated based on root _uniqueId and given query id",
      () => {
        const FOO_UNIQUE_ID = "foo-unique-id";
        helpers.uniqueId.returns(FOO_UNIQUE_ID);
        const TestOrigin = class extends Origin {};
        new TestOrigin(FOO_ID, []).query({
          foo: "foo-query"
        });
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(
          FOO_UNIQUE_ID,
          JSON.stringify({
            foo: "foo-query"
          })
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
      "private property _uniqueId should be calculated based on the combination of root _uniqueId and the extension of the queries ids",
      () => {
        const FOO_UNIQUE_ID = "foo-unique-id";
        helpers.uniqueId.returns(FOO_UNIQUE_ID);
        const TestOrigin = class extends Origin {};
        new TestOrigin(FOO_ID, [])
          .query({
            foo: "foo-query"
          })
          .query({
            foo2: "foo-query-2"
          });
        test.expect(helpers.queriedUniqueId).to.have.been.calledWith(
          FOO_UNIQUE_ID,
          JSON.stringify({
            foo: "foo-query",
            foo2: "foo-query-2"
          })
        );
      }
    );
  });
});
