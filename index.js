//in frontend javascript you can't use require
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constant.js"

const connectButton = document.getElementById("connectBtn")
const fundButton = document.getElementById("fundBtn")
const getBalanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawBtn")
connectButton.onclick = connect
fundButton.onclick = fund
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

// console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        //it is going to connect to chrome browser because we have our metamask installed on chrome browser
        window.ethereum.request({ method: "eth_requestAccounts" })
        //   console.log("connected!");
        connectButton.innerHTML = "Connected!"
    } else {
        //   console.log("No metamask");
        connectButton.innerHTML = "Please install Metamask!"
    }
}

// getBalance function
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}... `)
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        //signer / wallet / someone with gas
        //contract that we are interacting with
        //ABI & Address
        //Web3Provider is also like the JSONRPCProvider we usee in hardhat fund me to locate the endpoint or the RPC URL of the network we
        //want to use in solidity but here we are using Javascript so we will have to use Web3Provider to locate the endpoint inorder to make transaction on the website
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //this is going to return which ever wallet connect from the provider(metamask)
        //for example if we connect to account 1 on the metamask, then account 1 will be the signer of the provider(metamask)
        // console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //hey, wait for this TX to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve() //only finish this function once the transaction.hash is found
        })
    })
}

//withdraw function
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing....")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
