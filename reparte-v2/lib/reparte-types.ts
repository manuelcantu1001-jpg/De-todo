export type Role = 'guest' | 'member' | 'owner';
export type Currency = 'MXN' | 'USD';

export type EventMember = {
  id: string;
  name: string;
  role: 'member' | 'owner';
  mine: boolean;
  claimToken?: string;
};

export type EventExpense = {
  id: string;
  title: string;
  amountCents: number;
  currency: Currency;
  fxMillis: number;
  amountMxnCents: number;
  payerMemberId: string;
  payerName: string;
  amongIds: string[];
  spentOn: string;
  canEdit: boolean;
};

export type Transfer = {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amountCents: number;
  recipientClabe?: string;
  recipientBank?: string;
};

export type EventSnapshot = {
  id: string;
  slug: string;
  name: string;
  status: 'open' | 'closed';
  role: Role;
  version: number;
  updatedAt: string;
  me: EventMember | null;
  members: EventMember[];
  expenses: EventExpense[];
  visibleTotalCents: number;
  myBalanceCents: number | null;
  transfers: Transfer[];
};
