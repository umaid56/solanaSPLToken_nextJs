import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState, Fragment } from "react";
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";
import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon, CheckIcon } from "@heroicons/react/solid";

import {
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
  TransactionSignature,
  PublicKey,
  Transaction,
  GetProgramAccountsFilter,
} from "@solana/web3.js";

// let accountBundlers = new Map();
// accountBundlers.set("someaddress", 10)

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const TransferSPLTokens: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { getUserSOLBalance } = useUserSOLBalanceStore();
  const [tokenName, setTokenName] = useState("");
  const [receipentAddresses, setReceipentAddresses] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selected, setSelected] = useState(null);
  const [accountBundlers, setAccountBundlers] = useState(new Map());
  const [view, setView] = useState(null);




  async function isWalletConnected(){
  if (!publicKey) {
        console.log("error", "Wallet not connected!");
        notify({
          type: "error",
          message: "error",
          description: "Wallet not connected!",
        });
        return false;
      }
      return true;
}

      async function getTokenAddressAndBalance() {

        if (!isWalletConnected){
          return;
        }
        const filters: GetProgramAccountsFilter[] = [
          {
            dataSize: 165, //size of account (bytes)
          },
          {
            memcmp: {
              offset: 32, //location of our query in the account (bytes)
              bytes: publicKey.toBase58(), //our search criteria, a base58 encoded string
            },
          },
        ];

        const accounts = await connection.getParsedProgramAccounts(
          TOKEN_PROGRAM_ID,
          { filters: filters }
        );
        console.log(
          `Found ${
            accounts.length
          } token account(s) for wallet ${publicKey.toBase58()}.`
        );

        const accountsAndBalance = new Map();
        console.log("getTokenAddressAndBalance",Array.from((accountsAndBalance).keys()));

        accounts.forEach((account, i) => {
          //Parse the account data
          const parsedAccountInfo: any = account.account.data;
          const mintAddress: string =
            parsedAccountInfo["parsed"]["info"]["mint"];
          const tokenBalance: number =
            parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
          //Log results
          accountsAndBalance.set(mintAddress, tokenBalance);
          setAccountBundlers(accountBundlers.set(mintAddress, tokenBalance));
        });

        console.log("getTokenAddressAndBalance",Array.from((accountsAndBalance).keys()));
        setView(true);
      }




  const onClick = useCallback(async (tokenData) => {
    console.log("accountBundlers", accountBundlers.size)
      
        if (!isWalletConnected){
          return;
        }
    // await getTokenAddressAndBalance();



      


      // verify address
      let recipientAddressArray = [];
      const getAccountInfoPromise = [];
      tokenData.receipentAddresses
        .replace(/\s/g, "")
        .split(",")
        .forEach((account) => {
          console.log("tokenData.receipentAddresses:", account);
          getAccountInfoPromise.push(
            connection.getAccountInfo(new PublicKey(account.toString()))
          );
          recipientAddressArray.push(new PublicKey(account.toString()));
        });

      await Promise.any(getAccountInfoPromise).then((values) => {
        console.log("getAccountInfoPromise", values);
        if (values === null) {
          notify({ type: "error", message: `Invalid Addresses!` });
          console.log("error", `Invalid Addresses!`);
          recipientAddressArray = [];
          return;
        }
      });

      // verify amount
      if (!tokenData.tokenAmount.match(/^[0-9]+$/)) {
        notify({ type: "error", message: `Invalid Amount!` });
        console.log("error", `Invalid Amount!`);
        recipientAddressArray = [];
        return;
      }

      const mintToken = new PublicKey(
        tokenData.tokenAddress
      ); // SPL Token Address

      const associatedTokenFrom = await getAssociatedTokenAddress(
        mintToken,
        publicKey
      );

      // recipientAddressArray.push(
      //   new PublicKey("A8ZXQAR4YarHyYTXfwqCJRYghiHc39j6U6x2HpnFgUP8")
      // );
      // recipientAddressArray.push(
      //   new PublicKey("9ouBeUK4nw1hRBMgcwAoYxe8SR5B5ZcgwMENQHLqmuqd")
      // );

      console.log("recipientAddressArray", recipientAddressArray);
      const transactionInstructions = [];
      const tokenAmount = Math.floor(
        Number(tokenData.tokenAmount) / recipientAddressArray.length
      );
      for (let recipientAddress of recipientAddressArray) {
        const associatedTokenTo = await getAssociatedTokenAddress(
          mintToken,
          recipientAddress
        );

        if (!(await connection.getAccountInfo(associatedTokenTo))) {
          transactionInstructions.push(
            createAssociatedTokenAccountInstruction(
              publicKey,
              associatedTokenTo,
              recipientAddress,
              mintToken
            )
          );
        }

        const fromAccount = await getAccount(connection, associatedTokenFrom);

        transactionInstructions.push(
          createTransferInstruction(
            fromAccount.address, // source
            associatedTokenTo, // dest
            publicKey,
            tokenAmount // 6 decimal
          )
        );
      }

      let signature: TransactionSignature = "";
      try {
        const transaction = new Transaction().add(...transactionInstructions);

        signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, "confirmed");
        notify({
          type: "success",
          message: "Transaction successful!",
          txid: signature,
        });
      } catch (error: any) {
        notify({
          type: "error",
          message: `Transaction failed!`,
          description: error?.message,
          txid: signature,
        });
        console.log(
          "error",
          `Transaction failed! ${error?.message}`,
          signature
        );
        return;
      }
    },
    [publicKey, notify, connection, getUserSOLBalance]
  );


  
  return (
    <div className='text-gray-900'>
      {/* <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Token Mint Address"
        onChange={(e) => setTokenMint(e.target.value)}
      /> */}
      
      {!view ?       <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={() =>
          getTokenAddressAndBalance()
        }
      >
        <span>Get SPL Tokens</span>
      </button>
      : 
      <div>
<form >


      <Listbox value={selected} onChange={setSelected}>
        {() => (
          <>
            <div className="mt-1 relative">
              <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <span className="block truncate">
                  {!selected ? "Select Token Address" : selected}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <SelectorIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {Array.from(accountBundlers.keys()).map((bundler) => (
                    <Listbox.Option
                      key={bundler}
                      className={({ active }) =>
                        classNames(
                          active ? "text-white bg-purple-500" : "text-gray-900",
                          "cursor-default select-none relative py-2 pl-3 pr-9"
                        )
                      }
                      value={bundler}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {bundler}
                          </span>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-purple-500",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>




      <textarea
        // type="text"
        className="mt-2 form-control block mb-2 w-full pt-2 px-4 py-40 text-x font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Recipient Address"
        required
        onChange={(e) => setReceipentAddresses(e.target.value)}
      />




      <input
        type="text"
        required
        className="form-control block mb-2 w-full px-4 py-2 text-x font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        placeholder="Value"
        onChange={(e) => setTokenAmount(e.target.value)}
      />


      <button
      type="submit"
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onSubmit={() =>
          onClick({
            tokenName: tokenName,
            receipentAddresses: receipentAddresses,
            tokenAmount: tokenAmount,
            tokenAddress: selected,
          })
        }
      >
        <span>Transfer</span>
      </button>
</form>
      </div>
      }
    </div>
  );
};
