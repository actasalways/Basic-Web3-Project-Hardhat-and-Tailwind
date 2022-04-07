import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;


const handleChange = (e, name) => {
  setFormData((prevState) => ({
    ...prevState,
    [name]: e.target.value,
  }));
};

const getAllTransactions = async () =>{
  try {
    if (!ethereum) return alert("Please install metamask");
    const transactionsContract = getEthereumContract(); 
    
    const avaibleTransactions = await transactionsContract.getAllTransactions();

    console.log(avaibleTransactions);
  } catch (error) {
    console.log(error);
  }
}

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

    return transactionsContract; 

};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState();
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount')); 


  const checkIfWalletConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      // console.log(accounts);
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions(); 
      } else {
        // console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
    }
  };

  const  checkIfTransactionsExist = async () =>{
    try {
      const transactionsContract = getEthereumContract(); 
      const transactionCount = await transactionsContract.getTransactionCount(); 

      window.localStorage.setItem("transactionCount", transactionCount);

    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });
      setCurrentAccount(accounts[0]);

      window.location.reload();

    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };


  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
        const { addressTo, amount, keyword, message } = formData; 
        const transactionsContract= getEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
            method: "eth_sendTransaction",
            params: [{
              from: currentAccount,
              to: addressTo,
              gas: "0x76c0", // must be hex - 30400 GWEI
              gasPrice: 0x9184e72a000, // 10000000000000
              value: parsedAmount
            }],
          });

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);    
            
        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionCount = await transactionsContract.getTransactionCount(); 
        setTransactionCount(transactionCount.toNumber());
    
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
    checkIfTransactionsExist(); 
  }, [transactionCount]);

  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
