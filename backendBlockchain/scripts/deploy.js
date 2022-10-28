async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ExamFactory = await ethers.getContractFactory("ExamFactory");
  const examFactory = await ExamFactory.deploy();

  console.log("Exam Factory address:", examFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });