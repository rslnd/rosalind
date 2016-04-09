describe('zerofix', function () {
  var zerofix = Helpers.zerofix

  it('should not change correct phone number', function () {
    expect(zerofix('+43 0660 9911994')).toBe('+43 0660 9911994')
  })

  it('should change the letter O to zeroes', function () {
    expect(zerofix('o660 9911994')).toBe('0660 9911994')
    expect(zerofix('o66o 9911994')).toBe('0660 9911994')
    expect(zerofix('O66o 9911994')).toBe('0660 9911994')
    expect(zerofix('0oOo')).toBe('0000')
  })

  it('should not change the letter O to zeroes if they are in a word', function () {
    expect(zerofix('hello')).toBe('hello')
    expect(zerofix('0660 or 0660')).toBe('0660 or 0660')
    expect(zerofix('o660 oder 4oo4')).toBe('0660 oder 4004')
  })

  it('should split long numbers into chunks of four', function () {
    expect(zerofix('123456789')).toBe('1234 5678 9')
    expect(zerofix('o66o9911994')).toBe('0660 9911 994')
    expect(zerofix('this is a sentence')).toBe('this is a sentence')
  })

})
