
var test_ci = new Dry();

describe('Control Element: Button', function () {
    test_but = new Button("test1", "A0", test_ci);
    describe('Button instantiation', function () {
        it('should create an unsynched button', function () {
            expect(test_but.on_style).to.equal("");
            expect(test_but.jquery_obj).to.equal("");
        });
    });
    test_but2 = new Button("test2", "A0", test_ci);
    describe('Button link to html objects', function () {
        expected_selector = "button-test2-frame";
        test_but2.get_selector(`button-${test_but2.name}-frame`);
        it(`Should bind to object ${expected_selector}`, function() {
            // expect(test_but2.jquery_obj.is($(`#${expected_selector}`))).to.be.true;
            chai.assert(test_but2.jquery_obj.is($(`#${expected_selector}`)));
        });
    });
});