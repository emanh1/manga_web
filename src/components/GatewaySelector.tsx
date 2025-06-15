import React from "react";
import { useIPFSGateway } from "../contexts/IPFSGatewayContext";

const PRESET_GATEWAYS = [
  { label: "IPFS.io", value: "https://ipfs.io/ipfs/" },
  { label: "Cloudflare", value: "https://cloudflare-ipfs.com/ipfs/" },
  { label: "Infura", value: "https://infura-ipfs.io/ipfs/" },
];

function getCustomGateways(): string[] {
  try {
    return JSON.parse(localStorage.getItem('customIPFSGateways') || '[]');
  } catch {
    return [];
  }
}

const GatewaySelector: React.FC = () => {
  const { gateway, setGateway } = useIPFSGateway();
  const [customGateways, setCustomGateways] = React.useState<string[]>(getCustomGateways());
  const allGateways = [
    ...PRESET_GATEWAYS,
    ...customGateways.map(gw => ({ label: gw, value: gw })),
  ];
  const [selected, setSelected] = React.useState(() => {
    return allGateways.find((g) => g.value === gateway) ? gateway : PRESET_GATEWAYS[0].value;
  });

  React.useEffect(() => {
    setCustomGateways(getCustomGateways());
  }, []);
  React.useEffect(() => {
    setSelected(allGateways.find((g) => g.value === gateway) ? gateway : PRESET_GATEWAYS[0].value);
  }, [gateway, customGateways]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    setGateway(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={handleSelect}
        className="border rounded px-2 py-1 text-sm"
      >
        {allGateways.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GatewaySelector;
