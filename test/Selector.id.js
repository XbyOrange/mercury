const test = require("mocha-sinon-chai");

const { Origin } = require("../src/Origin");
const { Selector } = require("../src/Selector");
const helpers = require("../src/helpers");

test.describe("Selector id", () => {
  const FOO_ID = "foo-origin-id";
  const FOO_ID_2 = "foo-origin-2";
  const FOO_ID_3 = "foo-origin-3";
  let sandbox;
  let TestOrigin;
  let testOrigin;
  let testOrigin2;
  let testOrigin3;
  let testSelector;
  let selectorMethod;

  test.beforeEach(() => {
    sandbox = test.sinon.createSandbox();
    sandbox.stub(helpers, "uniqueId").returns("foo-unique-id");
    sandbox.stub(helpers, "selectorUniqueId").returns("foo-selector-unique-id");
    sandbox.stub(helpers, "queriedUniqueId");
    selectorMethod = originResult => originResult;
    TestOrigin = class extends Origin {
      _read() {
        return Promise.resolve();
      }
    };
    testOrigin = new TestOrigin(FOO_ID);
    testOrigin2 = new TestOrigin(FOO_ID_2);
    testOrigin3 = new TestOrigin(FOO_ID_3);
    testSelector = new Selector(testOrigin, selectorMethod);
  });

  test.afterEach(() => {
    sandbox.restore();
  });

  test.describe("without query", () => {
    test.it("private property _id should be equal to sources ids adding 'select:' prefix", () => {
      test.expect(testSelector._id).to.equal(`select:${FOO_ID}`);
    });

    test.it(
      "private property _uniqueId should be calculated based on selector id, default value, sources uniqueIds, sources queries and selector function",
      () => {
        return Promise.all([
          test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_ID}`, undefined),
          test
            .expect(helpers.selectorUniqueId)
            .to.have.been.calledWith("foo-unique-id", ["foo-unique-id"], selectorMethod, [])
        ]);
      }
    );
  });

  test.describe("with query", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        test.expect(testSelector.query("foo")._id).to.equal(`select:${FOO_ID}-"foo"`);
      }
    );

    test.it(
      "private property _uniqueId should be calculated based on selector unique id and query id",
      () => {
        const FOO_SELECTOR_UNIQUE_ID = "foo-selector-unique-id";
        helpers.selectorUniqueId.returns(FOO_SELECTOR_UNIQUE_ID);
        testSelector = new Selector(testOrigin, originResult => originResult);
        testSelector.query("foo");
        return test
          .expect(helpers.queriedUniqueId)
          .to.have.been.calledWith(FOO_SELECTOR_UNIQUE_ID, '"foo"');
      }
    );
  });

  test.describe("when sources are queryied", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testSelector = new Selector(
          {
            source: testOrigin,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:${FOO_ID}`);
      }
    );

    test.it(
      "private property _uniqueId should be calculated based on selector id, default value, sources uniqueIds, selector method, sources queries and sources catches",
      () => {
        helpers.uniqueId.reset();
        helpers.uniqueId.returns("foo-unique-id");
        helpers.selectorUniqueId.reset();
        const queryMethod = query => query;
        const catchMethod = query => query;
        testSelector = new Selector(
          {
            source: testOrigin,
            query: queryMethod,
            catch: catchMethod
          },
          selectorMethod
        );
        return Promise.all([
          test.expect(helpers.uniqueId).to.have.been.calledWith(`select:${FOO_ID}`, undefined),
          test
            .expect(helpers.selectorUniqueId)
            .to.have.been.calledWith(
              "foo-unique-id",
              ["foo-unique-id"],
              selectorMethod,
              [queryMethod],
              [catchMethod]
            )
        ]);
      }
    );
  });

  test.describe("when sources are concurrent", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testSelector = new Selector(
          [testOrigin3, testOrigin2],
          testOrigin,
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:${FOO_ID_3}:${FOO_ID_2}:${FOO_ID}`);
      }
    );

    test.it(
      "private property _uniqueId should be calculated based on selector id, default value, sources uniqueIds, selector method and sources queries",
      () => {
        helpers.uniqueId.reset();
        helpers.uniqueId.returns("foo-unique-id");
        helpers.selectorUniqueId.reset();
        testSelector = new Selector([testOrigin3, testOrigin2], testOrigin, selectorMethod);
        return Promise.all([
          test
            .expect(helpers.uniqueId)
            .to.have.been.calledWith(`select:${FOO_ID_3}:${FOO_ID_2}:${FOO_ID}`, undefined),
          test
            .expect(helpers.selectorUniqueId)
            .to.have.been.calledWith(
              "foo-unique-id",
              ["foo-unique-id", "foo-unique-id", "foo-unique-id"],
              selectorMethod,
              []
            )
        ]);
      }
    );
  });

  test.describe("when sources are concurrently queryied", () => {
    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the query id",
      () => {
        testSelector = new Selector(
          testOrigin3,
          [
            {
              source: testOrigin,
              query: query => query
            },
            {
              source: testOrigin2,
              query: query => query
            }
          ],
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:${FOO_ID_3}:${FOO_ID}:${FOO_ID_2}`);
      }
    );

    test.it(
      "private property _uniqueId should be calculated based on selector id, default value, sources uniqueIds, selector method and sources queries",
      () => {
        helpers.uniqueId.reset();
        helpers.uniqueId.returns("foo-unique-id");
        helpers.selectorUniqueId.reset();
        const queryMethod1 = query => query;
        const queryMethod2 = query => query;
        const catchMethod1 = query => query;
        const catchMethod2 = query => query;
        testSelector = new Selector(
          testOrigin3,
          [
            {
              source: testOrigin,
              query: queryMethod1,
              catch: catchMethod1
            },
            {
              source: testOrigin2,
              query: queryMethod2,
              catch: catchMethod2
            }
          ],
          selectorMethod
        );
        return Promise.all([
          test
            .expect(helpers.uniqueId)
            .to.have.been.calledWith(`select:${FOO_ID_3}:${FOO_ID}:${FOO_ID_2}`, undefined),
          test
            .expect(helpers.selectorUniqueId)
            .to.have.been.calledWith(
              "foo-unique-id",
              ["foo-unique-id", "foo-unique-id", "foo-unique-id"],
              selectorMethod,
              [queryMethod1, queryMethod2],
              [catchMethod1, catchMethod2]
            )
        ]);
      }
    );
  });

  test.describe("when sources are selectors", () => {
    let testOriginSelector;

    test.beforeEach(() => {
      testOriginSelector = new Selector(
        {
          source: testOrigin,
          query: query => query
        },
        result => result
      );
    });

    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the selector id",
      () => {
        testSelector = new Selector(
          {
            source: testOriginSelector,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector._id).to.equal(`select:select:foo-origin-id`);
      }
    );

    test.it(
      "private property _uniqueId should be calculated based on selector id, default value, sources uniqueIds, selector method and query methods",
      () => {
        helpers.uniqueId.reset();
        helpers.uniqueId.returns("foo-unique-id");
        helpers.selectorUniqueId.reset();
        helpers.selectorUniqueId.returns("foo-selector-unique-id");
        const queryMethod = result => result;
        const catchMethod = result => result;
        testOriginSelector = new Selector(
          {
            source: testOrigin,
            query: query => query
          },
          result => result
        );
        testSelector = new Selector(
          {
            source: testOriginSelector,
            query: queryMethod,
            catch: catchMethod
          },
          selectorMethod
        );
        return Promise.all([
          test
            .expect(helpers.uniqueId)
            .to.have.been.calledWith(`select:select:foo-origin-id`, undefined),
          test
            .expect(helpers.selectorUniqueId)
            .to.have.been.calledWith(
              "foo-unique-id",
              ["foo-selector-unique-id"],
              selectorMethod,
              [queryMethod],
              [catchMethod]
            )
        ]);
      }
    );

    test.it(
      "private property _id should be equal to sources ids adding 'select:' prefix and the the query id",
      () => {
        testSelector = new Selector(
          {
            source: testOriginSelector,
            query: query => query
          },
          originResult => originResult
        );
        test.expect(testSelector.query("foo")._id).to.equal(`select:select:foo-origin-id-"foo"`);
      }
    );
  });
});
