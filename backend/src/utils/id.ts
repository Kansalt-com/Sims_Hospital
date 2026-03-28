import dayjs from "dayjs";
import { randomBytes } from "node:crypto";

export const generateMrn = () => {
  const ts = dayjs().format("YYYYMMDDHHmmssSSS");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `MRN-${ts}-${rand}`;
};

export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
