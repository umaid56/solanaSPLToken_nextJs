import type { NextPage } from "next";
import Head from "next/head";
import { UpdateView } from "../views";

const Update: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>FoxPad | Update MetaData</title>
        <meta
          name="description"
          content="Solana Creator"
        />
      </Head>
      <UpdateView />
    </div>
  );
};

export default Update;