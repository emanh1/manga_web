import React, { useState } from "react";
import { useIPFSGateway } from "../contexts/IPFSGatewayContext";

const PRESET_GATEWAYS = [
  { label: "IPFS.io", value: "https://ipfs.io/ipfs/" },
  { label: "Cloudflare", value: "https://cloudflare-ipfs.com/ipfs/" },
  { label: "Infura", value: "https://infura-ipfs.io/ipfs/" },
  { label: "Custom", value: "custom" },
];

const GatewaySelector: React.FC = () => {
  const { gateway, setGateway } = useIPFSGateway();
  const [custom, setCustom] = useState(
    PRESET_GATEWAYS.some((g) => g.value === gateway) ? "" : gateway
  );
  const [selected, setSelected] = useState(
    PRESET_GATEWAYS.find((g) => g.value === gateway) ? gateway : "custom"
  );

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);
    if (val === "custom") {
      setGateway(custom || "https://ipfs.io/ipfs/");
    } else {
      setGateway(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustom(e.target.value);
    setGateway(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={handleSelect}
        className="border rounded px-2 py-1 text-sm"
      >
        {PRESET_GATEWAYS.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
      {selected === "custom" && (
        <input
          type="text"
          value={custom}
          onChange={handleCustomChange}
          className="border rounded px-2 py-1 text-sm"
          style={{ width: 320 }}
          placeholder="Custom IPFS Gateway URL (e.g. https://mygateway.com/ipfs/)"
        />
      )}
    </div>
  );
};

export default GatewaySelector;
