import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>FOXPAD | Home</title>
        <meta
          name="description"
          content="FOX PAD"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
