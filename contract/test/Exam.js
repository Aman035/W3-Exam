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
    await examFactory.createExam('test data', 123, 456, {
      value: '100000000000000000',
    })
    expect((await examFactory.getDeplyedExams()).length).to.equal(1)
  })
})
