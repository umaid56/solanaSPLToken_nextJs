import type { NextPage } from "next";
import Head from "next/head";
import { TransferView } from "../views";

const Transfer: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>FoxPad | Tranfer Token</title>
        <meta
          name="description"
        />
      </Head>
      <TransferView />
    </div>
  );
};

export default Transfer;
