const pricing = require('../pricing')
const products = require('./products')
const employee = require('./employee')
const expect = require('chai').expect

describe('calculateProductPrice', () => {
  it('returns the price for a medical product for a single employee', () => {
    const selectedOptions = { familyMembersToCover: ['ee'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(19.26)
  })

  it('returns the price for a medical product for an employee with a spouse', () => {
    const selectedOptions = { familyMembersToCover: ['ee', 'sp'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(21.71)
  })

  it('returns the price for a medical product for an employee with a spouse and one child', () => {
    const selectedOptions = { familyMembersToCover: ['ee', 'sp', 'ch'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(22.88)
  })

  it('returns the price for a voluntary life product for a single employee', () => {
    const selectedOptions = {
      familyMembersToCover: ['ee'],
      coverageLevel: [{ role: 'ee', coverage: 125000 }],
    }
    const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

    expect(price).to.equal(39.37)
  })

  it('returns the price for a voluntary life product for an employee with a spouse', () => {
    const selectedOptions = {
      familyMembersToCover: ['ee', 'sp'],
      coverageLevel: [
        { role: 'ee', coverage: 200000 },
        { role: 'sp', coverage: 75000 },
      ],
    }
    const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

    expect(price).to.equal(71.09)
  })

  it('returns the price for a disability product for an employee', () => {
    const selectedOptions = {
      familyMembersToCover: ['ee']
    }
    const price = pricing.calculateProductPrice(products.longTermDisability, employee, selectedOptions)

    expect(price).to.equal(22.04)
  })

  it('throws an error on unknown product type', () => {
    const unknownProduct = { type: 'vision' }

    expect(() => pricing.calculateProductPrice(unknownProduct, {}, {})).to.throw('Unknown product type: vision')
  })
})

describe('formatPrice', () => {
  it('Takes a price and convert it to 2 decimal places rounding down', () => {
    let floaty = 99.99999999999
    let result = pricing.formatPrice(floaty)

    expect(result).to.equal(99.99)
  })
  it('Returns a float even if price is in string format', () => {
    let floaty = '12.999999'
    let result = pricing.formatPrice(floaty)

    expect(result).to.equal(12.99)
  })
  it('Returns NaN if string cannt be parsed to int', () => {
    let floaty = "8bruh8"
    let result = pricing.formatPrice(floaty)

    expect(result).to.be.NaN
  })
})

describe('getEmployerContribution', () => {
  it('Gets employerContribution from long term disability plan and returns their contribution since mode is in dollars', () => {
    let employerContributesDollars = products.longTermDisability.employerContribution
    let price = 50
    let result = pricing.getEmployerContribution(employerContributesDollars, price)

    expect(result).to.equal(10)
  })

  it('Gets employerContribution from commuter plan and returns their contribution since mode is in dollars', () => {
    let employerContributesDollars = products.commuter.employerContribution
    let price = 50
    let result = pricing.getEmployerContribution(employerContributesDollars, price)

    expect(result).to.equal(75)
  })

  it('Returns the price discounted if contribution mode for a plan is not dollars', () => {
    let employerContributes = products.voluntaryLife.employerContribution
    let price = 50.75
    let result = pricing.getEmployerContribution(employerContributes, price)

    expect(result).to.equal(5.075)
  })

  it('Returns error if plan has undefined employer contribution', () => {
    let employerContributes = products.medical.employerContribution
    let price = 50
    let errorOccured = false

    try{
      let result = pricing.getEmployerContribution(employerContributes, price)
    }catch (err) {
      errorOccured = true
    }

    expect(errorOccured).to.equal(true)
  })


})

describe('getMedicalPricePerRole', () => {
  it('Searches an array of objects for one with the same role and returns its price', () => {
    let arrayOfCosts = products.medical.costs
    let role = 'ch'
    let result = pricing.getMedicalPricePerRole(role,arrayOfCosts)

    expect(result).to.equal(1.17)
  })

  it('Returns errors if searching for nonexistant roles in a plan', () => {
    let arrayOfCosts = products.voluntaryLife.costs
    let role = 'ch'
    let errorHappened = false

    try{
      let result = pricing.getMedicalPricePerRole(role,arrayOfCosts)
    }catch{
      errorHappened = true
    }

    expect(errorHappened).to.equal(true)
  })
  
})