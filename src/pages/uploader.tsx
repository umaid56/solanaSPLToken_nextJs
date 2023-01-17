import type { NextPage } from "next";
import Head from "next/head";
import { UploaderView } from "../views";

const Uploader: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>FoxPad | Upload MetaData</title>
        <meta
          name="description"
          content="Solana Token Creator"
        />
      </Head>
      <UploaderView />
    </div>
  );
};

export default Uploader;