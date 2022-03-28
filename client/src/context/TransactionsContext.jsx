import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

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
  const initialState = [];
  const [currentAccount, setcurrentAccount] = useState([]);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount')); 


  const handleChange = (e, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
  };

  const checkIfWalletConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      // console.log(accounts);
      if (accounts.lenght) {
        setCurrentAccount(accounts[0]);

      } else {
        // console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object");
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
              gas: "0x5208", // must be hex - 21000 GWEI
              value: parsedAmount._hex, // 0.0001 must convert and must be hex
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
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
