const pricing = require('../pricing')
const products = require('./products')
const employee = require('./employee')
const chai = require('chai')

const sinon = require("sinon")
const sinonChai = require("sinon-chai")

const { expect } = chai
chai.use(sinonChai)

describe('calculateProductPrice', () => {
  let sandbox, calculateMedicalPriceSpy, calculateVolLifePriceSpy, calculateLTDPriceSpy, formatPriceSpy

  before( () => {
    sandbox = sinon.createSandbox()
  })

  beforeEach(() => {
    calculateMedicalPriceSpy = sandbox.spy(pricing, 'calculateMedicalPrice')
    calculateVolLifePriceSpy = sandbox.spy(pricing, 'calculateVolLifePrice')
    calculateLTDPriceSpy = sandbox.spy(pricing, 'calculateLTDPrice')
    formatPriceSpy = sandbox.spy(pricing, 'formatPrice')

  })

  afterEach( () => {
    sandbox.restore()
  })

  it('returns the price for a medical product for a single employee', () => {
    const selectedOptions = { familyMembersToCover: ['ee'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(19.26)
    expect(calculateMedicalPriceSpy).to.have.callCount(1)
    expect(calculateVolLifePriceSpy).to.have.callCount(0)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(1)
  })

  it('returns the price for a medical product for an employee with a spouse', () => {
    const selectedOptions = { familyMembersToCover: ['ee', 'sp'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(21.71)
    expect(calculateMedicalPriceSpy).to.have.callCount(1)
    expect(calculateVolLifePriceSpy).to.have.callCount(0)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(1)
  })

  it('returns the price for a medical product for an employee with a spouse and one child', () => {
    const selectedOptions = { familyMembersToCover: ['ee', 'sp', 'ch'] }
    const price = pricing.calculateProductPrice(products.medical, employee, selectedOptions)

    expect(price).to.equal(22.88)
    expect(calculateMedicalPriceSpy).to.have.callCount(1)
    expect(calculateVolLifePriceSpy).to.have.callCount(0)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(1)
  })

  it('returns the price for a voluntary life product for a single employee', () => {
    const selectedOptions = {
      familyMembersToCover: ['ee'],
      coverageLevel: [{ role: 'ee', coverage: 125000 }],
    }
    const price = pricing.calculateProductPrice(products.voluntaryLife, employee, selectedOptions)

    expect(price).to.equal(39.37)
    expect(calculateMedicalPriceSpy).to.have.callCount(0)
    expect(calculateVolLifePriceSpy).to.have.callCount(1)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(1)
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
    expect(calculateMedicalPriceSpy).to.have.callCount(0)
    expect(calculateVolLifePriceSpy).to.have.callCount(1)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(1)
  })

  it('returns the price for a disability product for an employee', () => {
    const selectedOptions = {
      familyMembersToCover: ['ee']
    }
    const price = pricing.calculateProductPrice(products.longTermDisability, employee, selectedOptions)

    expect(price).to.equal(22.04)
    expect(calculateMedicalPriceSpy).to.have.callCount(0)
    expect(calculateVolLifePriceSpy).to.have.callCount(0)
    expect(calculateLTDPriceSpy).to.have.callCount(1)
    expect(formatPriceSpy).to.have.callCount(1)
  })

  it('throws an error on unknown product type', () => {
    const unknownProduct = { type: 'vision' }

    expect(() => pricing.calculateProductPrice(unknownProduct, {}, {})).to.throw('Unknown product type: vision')
    expect(calculateMedicalPriceSpy).to.have.callCount(0)
    expect(calculateVolLifePriceSpy).to.have.callCount(0)
    expect(calculateLTDPriceSpy).to.have.callCount(0)
    expect(formatPriceSpy).to.have.callCount(0)
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

describe('calculateMedicalPrice', ()=> {
  it('Returns the price of the medical plan based on how many roles the applicant has to cover', () => {
    let product = products.medical
    let selectedOptions = { familyMembersToCover: ['ee','sp'] }

    let result = pricing.calculateMedicalPrice(product,selectedOptions)

    expect(result).to.equal(21.71)
  })
})

describe('calculateVolLifePricePerRole', () => {
  it('Searches arrays of objects in VolLife to find the price based on the role given', () => {
    let role = 'ee'
    let coverageLevel = [{ role: 'ee', coverage: 125000 }]
    let costs = products.voluntaryLife.costs

    let result = pricing.calculateVolLifePricePerRole(role, coverageLevel, costs)

    expect(result).to.equal(43.75)
  })
})

describe('calculateVolLifePrice', () => {
  it('Returns price of VolLife package based on the sum of prices by roles given', () => {
    let product = products.voluntaryLife
    const selectedOptions = {
      familyMembersToCover: ['ee'],
      coverageLevel: [{ role: 'ee', coverage: 125000 }],
    }

    let result = pricing.calculateVolLifePrice(product, selectedOptions)
    expect(result).to.equal(43.75)
  })
})

describe('calculateLTDPrice', () => {
  it("returns price of LTD package; takes only the employee into account", () => {
    let product = products.longTermDisability
    let selectedOptions = {
      familyMembersToCover: ['sp','ch', 'ee']
    }

    let result = pricing.calculateProductPrice(product, employee, selectedOptions)

    expect(price).to.equal(22.04)
    console.log(result)
  })
})

