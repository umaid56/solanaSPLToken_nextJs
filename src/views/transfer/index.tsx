import { FC } from 'react';

import { TransferSPLTokens } from 'components/TrasnferTransaction';

export const TransferView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Transfer SPL Token
        </h1>      
        <div className="text-center">
          <TransferSPLTokens />
        </div>
      </div>
    </div>
  );
};
