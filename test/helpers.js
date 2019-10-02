const test = require("mocha-sinon-chai");

const helpers = require("../src/helpers");

test.describe("helpers", () => {
  test.describe("hash method", () => {
    test.it("should return a unique identifier based on provided string", () => {
      test.expect(helpers.hash("foo")).to.equal("101574");
    });

    test.it("should return alwys same identifier if same string is provided", () => {
      test.expect(helpers.hash("foo-string")).to.equal(helpers.hash("foo-string"));
    });

    test.it("should return different identifier if different strings are provided", () => {
      test.expect(helpers.hash("foo-1")).to.not.equal(helpers.hash("foo-2"));
    });
  });

  test.describe("uniqueId method", () => {
    test.it("should return the hash of provided id and stringified defaultValue", () => {
      test
        .expect(helpers.uniqueId("foo", { foo: "foo" }))
        .to.equal(helpers.hash('foo{"foo":"foo"}'));
    });
  });

  test.describe("queriedUniqueId method", () => {
    test.it("should return concated provided id and query id", () => {
      test.expect(helpers.queriedUniqueId("foo", "foo2")).to.equal("foo-foo2");
    });
  });

  test.describe("selectorUniqueId method", () => {
    test.it("should return concated provided id, selectors ids and selector method hash", () => {
      const fooSelectorMethod = () => "foo";
      test
        .expect(helpers.selectorUniqueId("foo", ["foo2", "foo3"], fooSelectorMethod, []))
        .to.equal(`foo-foo2-foo3-${helpers.functionId(fooSelectorMethod)}`);
    });

    test.it("should add hashes of all provided source queries", () => {
      const fooSelectorMethod = () => "foo";
      const fooQuery1 = () => "foo-1";
      const fooQuery2 = () => "foo-2";
      test
        .expect(
          helpers.selectorUniqueId("foo", ["foo2", "foo3"], fooSelectorMethod, [
            fooQuery1,
            fooQuery2
          ])
        )
        .to.equal(
          `foo-foo2-foo3-${helpers.functionId(fooSelectorMethod)}-${helpers.functionId(
            fooQuery1
          )}-${helpers.functionId(fooQuery2)}`
        );
    });
  });

  test.describe("functionId method", () => {
    test.it("should return a hash of stringified function", () => {
      const fooFunction = () => {
        return "foo";
      };
      test
        .expect(helpers.functionId(fooFunction))
        .to.equal(helpers.hash('functionfooFunction(){return"foo";}'));
    });
  });
});
