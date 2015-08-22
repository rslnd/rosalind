describe('Vacafix', function () {
  var vacafix = UI._globalHelpers.vacafix;

  it('should not change correct phone number', function () {
    expect(vacafix('+43 0660 9911994')).toBe('+43 0660 9911994');
  });

  it('should change change the letter O to zeroes', function () {
    expect(vacafix('o660 9911994')).toBe('0660 9911994');
    expect(vacafix('o66o 9911994')).toBe('0660 9911994');
    expect(vacafix('O66o 9911994')).toBe('0660 9911994');
    expect(vacafix('0oOoOo0')).toBe('0000000');
  });

  it('should not change change the letter O to zeroes if they are in a word', function () {
    expect(vacafix('hello')).toBe('hello');
    expect(vacafix('0660 or 0660')).toBe('0660 or 0660');
    expect(vacafix('o660 oder 4oo4')).toBe('0660 oder 4004');
  });

});
