import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
interface IPFSGatewayContextType {
  gateway: string;
  setGateway: (gateway: string) => void;
}

const DEFAULT_GATEWAY = "https://ipfs.io/ipfs/";

const IPFSGatewayContext = createContext<IPFSGatewayContextType>({
  gateway: DEFAULT_GATEWAY,
  setGateway: () => {},
});

export const useIPFSGateway = () => useContext(IPFSGatewayContext);

export const IPFSGatewayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gateway, setGateway] = useState<string>(() => {
    return localStorage.getItem("ipfsGateway") || DEFAULT_GATEWAY;
  });

  const updateGateway = (newGateway: string) => {
    setGateway(newGateway);
    localStorage.setItem("ipfsGateway", newGateway);
  };

  return (
    <IPFSGatewayContext.Provider value={{ gateway, setGateway: updateGateway }}>
      {children}
    </IPFSGatewayContext.Provider>
  );
};
