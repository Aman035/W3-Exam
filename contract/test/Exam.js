const { expect, assert } = require('chai')

describe('Exam Factory', () => {
  let examFactory

  beforeEach(async () => {
    const ExamFactory = await ethers.getContractFactory('ExamFactory')
    examFactory = await ExamFactory.deploy()
  })

  it('Deployment', async () => {
    const [owner, otherAccount] = await ethers.getSigners()
    expect(await examFactory.owner()).to.equal(owner.address)
  })

  it('Get Initial Exams', async () => {
    expect((await examFactory.getDeplyedExams()).length).to.equal(0)
  })

  it('Create Exam', async () => {
    await examFactory.createExam()
    expect((await examFactory.getDeplyedExams()).length).to.equal(1)
  })

  it('Destroy Contract (Not by Owner)', async () => {
    const accounts = await ethers.getSigners()
    await expect(examFactory.connect(accounts[1]).destroy()).to.be.reverted
  })

  it('Destroy Contract (By Owner)', async () => {
    await examFactory.destroy()
    try {
      await examFactory.owner()
      assert(false, 'Reverted')
    } catch (err) {
      assert(true)
    }
  })
})
