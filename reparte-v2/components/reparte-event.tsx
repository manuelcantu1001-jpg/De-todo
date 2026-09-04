'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Plus,
  Settings2,
  Share2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ReParteLogo } from '@/components/reparte-logo';
import type {
  Currency,
  EventExpense,
  EventSnapshot,
  Transfer,
} from '@/lib/reparte-types';
import { registerWebMcpTool } from '@/lib/webmcp';

const money = (cents: number, currency: Currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 ? 2 : 0,
  })
    .format(cents / 100)
    .replace('$', '$ ');

const shortDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day));
};

const today = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const clabeFormat = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 18)
    .replace(/(\d{3})(\d{3})(\d{0,11})(\d{0,1})/, (_match, a, b, c, d) =>
      [a, b, c, d].filter(Boolean).join(' '),
    );

async function responseError(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  return data.error || 'No pudimos completar la acción.';
}

export function ReParteEvent({ slug }: { slug: string }) {
  const [snapshot, setSnapshot] = useState<EventSnapshot | null>(null);
  const [view, setView] = useState<'expenses' | 'settlement'>('expenses');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [toast, setToast] = useState('');
  const [joinOpen, setJoinOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [payment, setPayment] = useState<Transfer | null>(null);
  const [editingExpense, setEditingExpense] = useState<EventExpense | null>(
    null,
  );
  const claimAttempted = useRef(false);
  const snapshotRef = useRef<EventSnapshot | null>(null);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const refresh = useCallback(
    async (quiet = false) => {
      if (!quiet) setSyncing(true);
      try {
        const response = await fetch(`/api/events/${slug}`, {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(await responseError(response));
        setSnapshot(await response.json());
        setFatalError('');
      } catch (reason) {
        if (!quiet)
          setFatalError(
            reason instanceof Error
              ? reason.message
              : 'No pudimos actualizar el evento.',
          );
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [slug],
  );

  const mutate = useCallback(
    async (
      path: string,
      body: unknown,
      method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
    ) => {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const data = (await response.json()) as Record<string, unknown>;
      await refresh(true);
      return data;
    },
    [refresh],
  );

  const showToast = useCallback((message: string) => {
    window.setTimeout(() => setToast(message), 0);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(true), 4000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (!snapshot || snapshot.role !== 'guest' || claimAttempted.current)
      return;
    const claimToken = new URLSearchParams(window.location.search).get('claim');
    if (!claimToken) return;
    claimAttempted.current = true;
    const timer = window.setTimeout(() => {
      void mutate(`/api/events/${slug}/join`, { claimToken })
        .then(() => {
          window.history.replaceState({}, '', `/e/${slug}`);
          showToast('Entraste con tu invitación personal.');
        })
        .catch((reason) =>
          setFatalError(
            reason instanceof Error
              ? reason.message
              : 'La invitación no es válida.',
          ),
        );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mutate, showToast, slug, snapshot]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const disposeRead = registerWebMcpTool({
      name: 'read_event_summary',
      title: 'Leer resumen de ReParte',
      description:
        'Devuelve el estado visible para esta persona: total, saldo, gastos y transferencias propias.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute() {
        const current = snapshotRef.current;
        if (!current) throw new Error('El evento todavía está cargando.');
        return {
          name: current.name,
          status: current.status,
          role: current.role,
          version: current.version,
          visibleTotalCents: current.visibleTotalCents,
          myBalanceCents: current.myBalanceCents,
          visibleExpenses: current.expenses.map((expense) => ({
            description: expense.title,
            amountCents: expense.amountCents,
            currency: expense.currency,
            paidBy: expense.payerName,
          })),
          myTransfers: current.transfers.map((transfer) => ({
            from: transfer.fromName,
            to: transfer.toName,
            amountCents: transfer.amountCents,
          })),
        };
      },
    });

    const disposeExpense = registerWebMcpTool({
      name: 'add_equal_expense',
      title: 'Agregar gasto dividido en partes iguales',
      description:
        'Guarda un gasto en el evento abierto y lo divide en partes iguales entre las personas indicadas.',
      inputSchema: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            exclusiveMinimum: 0,
            maximum: 1000000,
            description: 'Monto en la moneda indicada.',
          },
          description: { type: 'string', maxLength: 40 },
          currency: { type: 'string', enum: ['MXN', 'USD'], default: 'MXN' },
          exchangeRate: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: 'Pesos por dólar; requerido para USD.',
          },
          paidBy: {
            type: 'string',
            description:
              'Nombre exacto de quien pagó; si se omite, pagó la persona actual.',
          },
          splitAmong: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            description:
              'Nombres exactos; si se omite, se reparte entre todos.',
          },
          spentOn: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
        required: ['amount'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const current = snapshotRef.current;
        if (!current) throw new Error('El evento todavía está cargando.');
        if (current.role === 'guest')
          throw new Error('Entra al evento antes de agregar gastos.');
        if (current.status === 'closed')
          throw new Error('El evento está cerrado.');
        if (!input || typeof input !== 'object')
          throw new Error('Faltan los datos del gasto.');
        const values = input as Record<string, unknown>;
        const amount =
          typeof values.amount === 'number' ? values.amount : Number.NaN;
        if (!Number.isFinite(amount) || amount <= 0)
          throw new Error('El monto debe ser mayor que cero.');
        const findMember = (name: unknown) =>
          current.members.find(
            (member) =>
              typeof name === 'string' &&
              member.name.localeCompare(name, 'es', { sensitivity: 'base' }) ===
                0,
          );
        const payer =
          values.paidBy === undefined ? current.me : findMember(values.paidBy);
        if (!payer)
          throw new Error('No encontramos a quien pagó en este evento.');
        const participants =
          values.splitAmong === undefined
            ? current.members
            : Array.isArray(values.splitAmong)
              ? values.splitAmong.map(findMember)
              : [];
        if (!participants.length || participants.some((member) => !member)) {
          throw new Error('Alguna persona del reparto no pertenece al evento.');
        }
        const currency = values.currency === 'USD' ? 'USD' : 'MXN';
        const exchangeRate =
          typeof values.exchangeRate === 'number' ? values.exchangeRate : 18.4;
        const result = await mutate(`/api/events/${slug}/expenses`, {
          title:
            typeof values.description === 'string' ? values.description : '',
          amountCents: Math.round(amount * 100),
          currency,
          fxMillis: Math.round(exchangeRate * 1000),
          payerMemberId: payer.id,
          amongIds: participants.map((member) => member?.id),
          spentOn:
            typeof values.spentOn === 'string' ? values.spentOn : today(),
        });
        showToast('Gasto guardado y sincronizado');
        return { id: result.id, status: 'saved' };
      },
    });
    return () => {
      disposeExpense();
      disposeRead();
    };
  }, [mutate, showToast, slug]);

  async function copyText(text: string, message = 'Copiado') {
    await navigator.clipboard.writeText(text);
    showToast(message);
  }

  async function shareEvent() {
    const url = `${window.location.origin}/e/${slug}`;
    const data = {
      title: snapshot?.name ?? 'ReParte',
      text: `Entra al ReParte de ${snapshot?.name ?? 'nuestro evento'}. No necesitas cuenta.`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        return;
      }
    } else {
      await copyText(url, 'Link copiado');
    }
  }

  if (loading)
    return (
      <main className="rp-shell">
        <div className="rp-loading">Abriendo el evento…</div>
      </main>
    );
  if (!snapshot)
    return (
      <main className="rp-shell">
        <header className="rp-topbar">
          <Link className="rp-back" href="/">
            <ArrowLeft /> Inicio
          </Link>
        </header>
        <div className="rp-content">
          <h1>No pudimos abrirlo</h1>
          <p className="rp-lede">{fatalError}</p>
        </div>
      </main>
    );

  const myBalance = snapshot.myBalanceCents;
  const balanceLabel =
    myBalance === null
      ? 'Tu saldo'
      : myBalance > 0
        ? 'Te deben'
        : myBalance < 0
          ? 'Debes'
          : 'Estás al corriente';
  const balanceClass =
    myBalance === null || myBalance === 0
      ? ''
      : myBalance > 0
        ? 'positive'
        : 'negative';

  return (
    <main className="rp-shell">
      <header className="rp-topbar">
        <Link className="rp-back" href="/">
          <ArrowLeft aria-hidden="true" /> Inicio
        </Link>
        <div className="rp-sync">
          {syncing ? 'Actualizando…' : 'Sincronizado'}
        </div>
        <button className="rp-icon-button" onClick={() => setInviteOpen(true)}>
          <Share2 aria-hidden="true" /> Invitar
        </button>
      </header>

      {view === 'expenses' ? (
        <section className="rp-content">
          <p className="rp-eyebrow">
            Evento {snapshot.status === 'open' ? 'abierto' : 'cerrado'} ·{' '}
            {snapshot.members.length}{' '}
            {snapshot.members.length === 1 ? 'persona' : 'personas'}
            {snapshot.role === 'guest' ? ' · viendo como invitado' : ''}
          </p>
          <h1>{snapshot.name}</h1>
          <div className="rp-total-grid">
            <div className="rp-card">
              <div className="rp-label">Total visible</div>
              <div className="rp-money">
                {money(snapshot.visibleTotalCents)}
              </div>
            </div>
            <div className="rp-card">
              <div className="rp-label">{balanceLabel}</div>
              <div className={`rp-money ${balanceClass}`}>
                {myBalance === null
                  ? '—'
                  : myBalance === 0
                    ? '—'
                    : money(Math.abs(myBalance))}
              </div>
            </div>
          </div>

          <section className="rp-expenses" aria-labelledby="expenses-title">
            <h2 className="rp-section-title" id="expenses-title">
              Gastos que puedes ver
            </h2>
            <div className="rp-list">
              {snapshot.expenses.length ? (
                snapshot.expenses.map((expense) => (
                  <button
                    className="rp-row"
                    disabled={!expense.canEdit || snapshot.status === 'closed'}
                    key={expense.id}
                    onClick={() => {
                      setEditingExpense(expense);
                      setExpenseOpen(true);
                    }}
                  >
                    <span className="rp-avatar">
                      {expense.title.charAt(0).toUpperCase()}
                    </span>
                    <span className="rp-row-copy">
                      <strong>{expense.title}</strong>
                      <small>
                        Pagó{' '}
                        {expense.payerMemberId === snapshot.me?.id
                          ? 'tú'
                          : expense.payerName}{' '}
                        · entre{' '}
                        {expense.amongIds.length === snapshot.members.length
                          ? 'todos'
                          : expense.amongIds.length}{' '}
                        · {shortDate(expense.spentOn)}
                      </small>
                    </span>
                    <span className="rp-expense-amount">
                      <strong>
                        {money(expense.amountCents, expense.currency)}
                      </strong>
                      {expense.currency === 'USD' ? (
                        <small>≈ {money(expense.amountMxnCents)} MXN</small>
                      ) : null}
                    </span>
                    {expense.canEdit && snapshot.status === 'open' ? (
                      <ChevronRight aria-hidden="true" />
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="rp-card rp-empty">
                  Todavía no hay gastos visibles.
                  <br />
                  El primer monto se guarda en segundos.
                </div>
              )}
            </div>
          </section>

          <section className="rp-members" aria-labelledby="members-title">
            <h2 className="rp-section-title" id="members-title">
              Quiénes
            </h2>
            <div className="rp-chips">
              {snapshot.members.map((member) =>
                member.mine ? (
                  <button
                    className="rp-chip is-on"
                    key={member.id}
                    onClick={() => setProfileOpen(true)}
                  >
                    {member.name} (tú)
                  </button>
                ) : (
                  <span className="rp-chip" key={member.id}>
                    {member.name}
                  </span>
                ),
              )}
              {snapshot.role === 'owner' ? (
                <button className="rp-chip" onClick={() => setMemberOpen(true)}>
                  <Plus aria-hidden="true" /> Agregar
                </button>
              ) : null}
            </div>
          </section>
          {fatalError ? (
            <output className="rp-error">{fatalError}</output>
          ) : null}
        </section>
      ) : (
        <SettlementView
          snapshot={snapshot}
          onPayment={setPayment}
          onStatus={async (status) => {
            try {
              await mutate(`/api/events/${slug}/status`, { status });
              showToast(
                status === 'closed' ? 'Evento cerrado' : 'Evento reabierto',
              );
            } catch (reason) {
              showToast(
                reason instanceof Error
                  ? reason.message
                  : 'No pudimos cambiar el evento.',
              );
            }
          }}
          onShare={async () => {
            const text = `${snapshot.name}: ${myBalance === null || myBalance === 0 ? 'estás al corriente' : myBalance > 0 ? `te deben ${money(myBalance)}` : `debes ${money(-myBalance)}`}.`;
            if (navigator.share)
              await navigator
                .share({ title: snapshot.name, text })
                .catch(() => undefined);
            else await copyText(text, 'Resumen copiado');
          }}
        />
      )}

      <div className="rp-bottom-actions">
        {view === 'expenses' ? (
          <>
            <Button
              className="rp-secondary"
              onClick={() => setView('settlement')}
            >
              Liquidación
            </Button>
            {snapshot.role === 'guest' ? (
              <Button className="rp-primary" onClick={() => setJoinOpen(true)}>
                Entrar al evento
              </Button>
            ) : (
              <Button
                className="rp-primary"
                disabled={snapshot.status === 'closed'}
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseOpen(true);
                }}
              >
                <Plus /> Gasto
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              className="rp-secondary"
              onClick={() => setView('expenses')}
            >
              Ver gastos
            </Button>
            {snapshot.role === 'owner' ? (
              <Button
                className="rp-primary"
                onClick={() =>
                  void mutate(`/api/events/${slug}/status`, {
                    status: snapshot.status === 'open' ? 'closed' : 'open',
                  })
                    .then(() =>
                      showToast(
                        snapshot.status === 'open'
                          ? 'Evento cerrado'
                          : 'Evento reabierto',
                      ),
                    )
                    .catch((reason) => showToast(reason.message))
                }
              >
                {snapshot.status === 'open' ? 'Cerrar evento' : 'Reabrir'}
              </Button>
            ) : snapshot.role === 'guest' ? (
              <Button className="rp-primary" onClick={() => setJoinOpen(true)}>
                Entrar
              </Button>
            ) : (
              <Button
                className="rp-primary"
                onClick={() => setInviteOpen(true)}
              >
                Compartir
              </Button>
            )}
          </>
        )}
      </div>

      <JoinSheet
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onJoin={async (name) => {
          await mutate(`/api/events/${slug}/join`, { name });
          setJoinOpen(false);
          showToast(`Ya estás dentro, ${name}.`);
        }}
      />
      <ExpenseSheet
        key={`${editingExpense?.id ?? 'new'}:${snapshot.members.map((member) => member.id).join(':')}`}
        expense={editingExpense}
        open={expenseOpen}
        onOpenChange={(open) => {
          setExpenseOpen(open);
          if (!open) setEditingExpense(null);
        }}
        snapshot={snapshot}
        onSave={async (body) => {
          await mutate(
            editingExpense
              ? `/api/events/${slug}/expenses/${editingExpense.id}`
              : `/api/events/${slug}/expenses`,
            body,
            editingExpense ? 'PATCH' : 'POST',
          );
          setExpenseOpen(false);
          setEditingExpense(null);
          showToast(
            editingExpense
              ? 'Gasto corregido y sincronizado'
              : 'Gasto guardado y sincronizado',
          );
        }}
        onDelete={
          editingExpense
            ? async () => {
                await mutate(
                  `/api/events/${slug}/expenses/${editingExpense.id}`,
                  {},
                  'DELETE',
                );
                setExpenseOpen(false);
                setEditingExpense(null);
                showToast('Gasto borrado');
              }
            : undefined
        }
      />
      <InviteSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        snapshot={snapshot}
        onShare={shareEvent}
        onCopy={copyText}
      />
      <MemberSheet
        open={memberOpen}
        onOpenChange={setMemberOpen}
        onAdd={async (name) => {
          await mutate(`/api/events/${slug}/members`, { name });
          setMemberOpen(false);
          setInviteOpen(true);
          showToast(`${name} ya está en el evento`);
        }}
      />
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onSave={async (clabe) => {
          await mutate(`/api/events/${slug}/profile`, { clabe }, 'PATCH');
          setProfileOpen(false);
          showToast('CLABE guardada de forma privada');
        }}
      />
      <PaymentSheet
        open={Boolean(payment)}
        transfer={payment}
        meId={snapshot.me?.id ?? null}
        onOpenChange={(open) => {
          if (!open) setPayment(null);
        }}
        onConfirm={async (transfer, amountCents) => {
          await mutate(`/api/events/${slug}/payments`, {
            fromMemberId: transfer.fromMemberId,
            toMemberId: transfer.toMemberId,
            amountCents,
          });
          setPayment(null);
          showToast(
            amountCents < transfer.amountCents
              ? 'Pago parcial confirmado'
              : 'Pago confirmado',
          );
        }}
        onCopy={copyText}
      />

      {toast ? (
        <output className="rp-toast" aria-live="polite">
          {toast}
        </output>
      ) : null}
    </main>
  );
}

function SettlementView({
  snapshot,
  onPayment,
  onStatus,
  onShare,
}: {
  snapshot: EventSnapshot;
  onPayment: (transfer: Transfer) => void;
  onStatus: (status: 'open' | 'closed') => Promise<void>;
  onShare: () => Promise<void>;
}) {
  const balance = snapshot.myBalanceCents;
  return (
    <section
      className={snapshot.status === 'closed' ? 'rp-summary' : 'rp-content'}
    >
      {snapshot.status === 'closed' ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <ReParteLogo level label={false} />
        </div>
      ) : null}
      <p className="rp-eyebrow">
        {snapshot.status === 'closed' ? 'Evento cerrado' : 'Tu liquidación'}
      </p>
      <h2>
        {snapshot.status === 'closed' ? snapshot.name : 'Así queda tu cuenta'}
      </h2>
      {snapshot.role === 'guest' ? (
        <div className="rp-card rp-empty" style={{ marginTop: 22 }}>
          Entra con tu nombre para ver únicamente tu saldo y tus transferencias.
        </div>
      ) : (
        <>
          <div className="rp-settlement">
            <div className="rp-balance-card">
              <span className="rp-label">
                {balance && balance > 0
                  ? 'Te deben'
                  : balance && balance < 0
                    ? 'Debes'
                    : 'Estás al corriente'}
              </span>
              <strong
                className={
                  balance && balance > 0
                    ? 'positive'
                    : balance && balance < 0
                      ? 'negative'
                      : ''
                }
              >
                {balance ? money(Math.abs(balance)) : 'Todo listo'}
              </strong>
              <small className="rp-label">Solo tú ves este saldo.</small>
            </div>
            {snapshot.transfers.map((transfer) => (
              <button
                className="rp-row rp-transfer"
                key={`${transfer.fromMemberId}-${transfer.toMemberId}`}
                onClick={() => onPayment(transfer)}
              >
                <span className="rp-row-copy">
                  <p>
                    {transfer.fromName} → {transfer.toName}
                  </p>
                  <small>
                    {transfer.toMemberId === snapshot.me?.id
                      ? 'Toca para confirmar cuando recibas'
                      : 'Toca para ver cómo pagar'}
                  </small>
                </span>
                <span className="rp-expense-amount">
                  <strong>{money(transfer.amountCents)}</strong>
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
          {!snapshot.transfers.length ? (
            <p className="rp-lede">No tienes transferencias pendientes.</p>
          ) : null}
          {snapshot.status === 'closed' ? (
            <Button
              className="rp-secondary"
              style={{
                marginTop: 22,
                width: '100%',
                background: 'var(--background)',
              }}
              onClick={() => void onShare()}
            >
              <Share2 /> Compartir mi resumen
            </Button>
          ) : null}
        </>
      )}
      {snapshot.status === 'closed' && snapshot.role === 'owner' ? (
        <button
          className="rp-link"
          style={{ marginTop: 18 }}
          onClick={() => void onStatus('open')}
        >
          Reabrir para corregir algo
        </button>
      ) : null}
    </section>
  );
}

function JoinSheet({
  open,
  onOpenChange,
  onJoin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom">
        <SheetHeader style={{ paddingInline: 0 }}>
          <SheetTitle className="rp-sheet-title">¿Cómo te llamas?</SheetTitle>
          <SheetDescription className="rp-sheet-copy">
            Sin cuenta, sin contraseña. Solo para saber qué gastos y saldo son
            tuyos.
          </SheetDescription>
        </SheetHeader>
        <form
          className="rp-sheet-body"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onJoin(name.trim());
              setName('');
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : 'No pudimos agregarte.',
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="rp-field">
            <span>Tu nombre</span>
            <input
              autoComplete="name"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {error ? (
            <p className="rp-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="rp-primary"
            disabled={busy || !name.trim()}
            type="submit"
          >
            {busy ? 'Entrando…' : 'Entrar al evento'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ExpenseSheet({
  open,
  onOpenChange,
  snapshot,
  expense,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: EventSnapshot;
  expense: EventExpense | null;
  onSave: (body: unknown) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [amount, setAmount] = useState(
    expense ? (expense.amountCents / 100).toString() : '',
  );
  const [currency, setCurrency] = useState<Currency>(
    expense?.currency ?? 'MXN',
  );
  const [fx, setFx] = useState(
    expense ? (expense.fxMillis / 1000).toFixed(2) : '18.40',
  );
  const [title, setTitle] = useState(
    expense?.title === 'Gasto' ? '' : (expense?.title ?? ''),
  );
  const [payer, setPayer] = useState(
    expense?.payerMemberId ?? snapshot.me?.id ?? '',
  );
  const [among, setAmong] = useState(
    expense?.amongIds ?? snapshot.members.map((member) => member.id),
  );
  const [splitOpen, setSplitOpen] = useState(false);
  const [spentOn, setSpentOn] = useState(expense?.spentOn ?? today());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const amountCents = Math.round(Number(amount || 0) * 100);
  const all = among.length === snapshot.members.length;

  function key(value: string) {
    if (value === '⌫') return setAmount((current) => current.slice(0, -1));
    if (value === '.')
      return setAmount((current) =>
        current.includes('.') ? current : `${current || '0'}.`,
      );
    setAmount((current) => {
      if (current.includes('.') && current.split('.')[1].length >= 2)
        return current;
      if (current.replace('.', '').length >= 9) return current;
      return current === '0' ? value : current + value;
    });
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({
        title,
        amountCents,
        currency,
        fxMillis: Math.round(Number(fx) * 1000),
        payerMemberId: payer,
        amongIds: among,
        spentOn,
      });
      setAmount('');
      setTitle('');
      setCurrency('MXN');
      setSplitOpen(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'No pudimos guardar.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom" showCloseButton={false}>
        <form className="rp-sheet-body" onSubmit={submit}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              className="rp-link"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
            <div className="rp-segment">
              <button
                className={currency === 'MXN' ? 'is-on' : ''}
                type="button"
                onClick={() => setCurrency('MXN')}
              >
                MXN
              </button>
              <button
                className={currency === 'USD' ? 'is-on' : ''}
                type="button"
                onClick={() => setCurrency('USD')}
              >
                USD
              </button>
            </div>
            <span style={{ width: 60 }} />
          </div>
          {expense ? (
            <p className="rp-eyebrow" style={{ textAlign: 'center' }}>
              Corrigiendo gasto
            </p>
          ) : null}
          <div className="rp-amount-display" aria-live="polite">
            <span>{currency === 'USD' ? 'US$' : '$'}</span>
            {amount || '0'}
          </div>
          {currency === 'USD' ? (
            <label className="rp-field">
              <span>Tipo de cambio · pesos por dólar</span>
              <input
                inputMode="decimal"
                value={fx}
                onChange={(event) => setFx(event.target.value)}
              />
            </label>
          ) : null}
          <button
            className="rp-pill"
            type="button"
            onClick={() => setSplitOpen((current) => !current)}
          >
            {payer === snapshot.me?.id
              ? 'Pagaste tú'
              : `Pagó ${snapshot.members.find((member) => member.id === payer)?.name}`}{' '}
            · {all ? 'entre todos' : `entre ${among.length}`} · hoy{' '}
            <Settings2 aria-hidden="true" />
          </button>
          {splitOpen ? (
            <div className="rp-split-panel">
              <fieldset>
                <legend>Quién pagó</legend>
                <div className="rp-chips">
                  {snapshot.members.map((member) => (
                    <button
                      className={`rp-chip${payer === member.id ? ' is-on' : ''}`}
                      type="button"
                      key={member.id}
                      onClick={() => setPayer(member.id)}
                    >
                      {member.mine ? 'Tú' : member.name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Entre quiénes</legend>
                <div className="rp-chips">
                  {snapshot.members.map((member) => (
                    <button
                      className={`rp-chip${among.includes(member.id) ? ' is-on' : ''}`}
                      type="button"
                      key={member.id}
                      onClick={() =>
                        setAmong((current) =>
                          current.includes(member.id)
                            ? current.length === 1
                              ? current
                              : current.filter((id) => id !== member.id)
                            : [...current, member.id],
                        )
                      }
                    >
                      {member.mine ? 'Tú' : member.name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="rp-field">
                <span>Fecha</span>
                <input
                  type="date"
                  value={spentOn}
                  onChange={(event) => setSpentOn(event.target.value)}
                />
              </label>
            </div>
          ) : null}
          <label className="rp-field">
            <span>Descripción opcional</span>
            <input
              maxLength={40}
              placeholder="Si no escribes, se llama “Gasto”"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="rp-keypad" aria-label="Teclado para el monto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(
              (value) => (
                <button type="button" key={value} onClick={() => key(value)}>
                  {value}
                </button>
              ),
            )}
          </div>
          {error ? (
            <p className="rp-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="rp-primary"
            disabled={busy || amountCents <= 0 || !among.length || !payer}
            type="submit"
          >
            {busy
              ? 'Guardando…'
              : expense
                ? `Guardar cambios · ${money(amountCents, currency)}`
                : amountCents > 0
                  ? `Guardar ${money(amountCents, currency)}`
                  : 'Escribe el monto'}
          </Button>
          {onDelete ? (
            confirmDelete ? (
              <div className="rp-delete-confirm">
                <span>¿Borrar este gasto?</span>
                <button type="button" onClick={() => setConfirmDelete(false)}>
                  No
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      await onDelete();
                    } catch (reason) {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : 'No pudimos borrarlo.',
                      );
                      setBusy(false);
                    }
                  }}
                >
                  Sí, borrar
                </button>
              </div>
            ) : (
              <button
                className="rp-danger-link"
                type="button"
                onClick={() => setConfirmDelete(true)}
              >
                Borrar gasto
              </button>
            )
          ) : null}
        </form>
      </SheetContent>
    </Sheet>
  );
}

function InviteSheet({
  open,
  onOpenChange,
  snapshot,
  onShare,
  onCopy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: EventSnapshot;
  onShare: () => Promise<void>;
  onCopy: (text: string, message?: string) => Promise<void>;
}) {
  const base =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/e/${snapshot.slug}`;
  const pending = snapshot.members.filter((member) => member.claimToken);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom">
        <SheetHeader style={{ paddingInline: 0 }}>
          <SheetTitle className="rp-sheet-title">Invita al grupo</SheetTitle>
          <SheetDescription className="rp-sheet-copy">
            El mismo link abre el mismo evento. Los cambios aparecen en todos
            los teléfonos.
          </SheetDescription>
        </SheetHeader>
        <div className="rp-sheet-body">
          <div className="rp-clabe">{base}</div>
          <Button className="rp-primary" onClick={() => void onShare()}>
            <Share2 /> Compartir link general
          </Button>
          {pending.length ? (
            <>
              <p className="rp-section-title" style={{ marginTop: 10 }}>
                Invitaciones personales
              </p>
              {pending.map((member) => (
                <button
                  className="rp-row"
                  key={member.id}
                  onClick={() =>
                    void onCopy(
                      `${base}?claim=${member.claimToken}`,
                      `Invitación de ${member.name} copiada`,
                    )
                  }
                >
                  <span className="rp-avatar">{member.name.charAt(0)}</span>
                  <span className="rp-row-copy">
                    <strong>{member.name}</strong>
                    <small>Para reclamar su lugar sin suplantaciones</small>
                  </span>
                  <Copy />
                </button>
              ))}
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MemberSheet({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom">
        <SheetHeader style={{ paddingInline: 0 }}>
          <SheetTitle className="rp-sheet-title">Agregar a alguien</SheetTitle>
          <SheetDescription className="rp-sheet-copy">
            Puede existir como participante sin tener teléfono. También
            recibirás un link personal por si después quiere entrar.
          </SheetDescription>
        </SheetHeader>
        <form
          className="rp-sheet-body"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onAdd(name.trim());
              setName('');
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : 'No pudimos agregarlo.',
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="rp-field">
            <span>Nombre</span>
            <input
              autoComplete="name"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {error ? <p className="rp-error">{error}</p> : null}
          <Button
            className="rp-primary"
            disabled={busy || !name.trim()}
            type="submit"
          >
            <Users /> Agregar
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ProfileSheet({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (clabe: string) => Promise<void>;
}) {
  const [clabe, setClabe] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom">
        <SheetHeader style={{ paddingInline: 0 }}>
          <SheetTitle className="rp-sheet-title">Cómo pagarte</SheetTitle>
          <SheetDescription className="rp-sheet-copy">
            Tu CLABE solo se entrega a quien tenga una transferencia pendiente
            hacia ti.
          </SheetDescription>
        </SheetHeader>
        <form
          className="rp-sheet-body"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onSave(clabe);
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : 'No pudimos guardar.',
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="rp-field">
            <span>CLABE · 18 dígitos</span>
            <input
              autoComplete="off"
              inputMode="numeric"
              value={clabeFormat(clabe)}
              onChange={(event) =>
                setClabe(event.target.value.replace(/\D/g, ''))
              }
            />
          </label>
          {error ? <p className="rp-error">{error}</p> : null}
          <Button
            className="rp-primary"
            disabled={busy || (clabe.length > 0 && clabe.length !== 18)}
            type="submit"
          >
            Guardar
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function PaymentSheet({
  open,
  transfer,
  meId,
  onOpenChange,
  onConfirm,
  onCopy,
}: {
  open: boolean;
  transfer: Transfer | null;
  meId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (transfer: Transfer, amountCents: number) => Promise<void>;
  onCopy: (text: string, message?: string) => Promise<void>;
}) {
  const [partial, setPartial] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!transfer) return null;
  const incoming = transfer.toMemberId === meId;
  const partialCents = Math.round(Number(partial || 0) * 100);
  const concept = 'ReParte';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rp-sheet" side="bottom">
        <SheetHeader style={{ paddingInline: 0 }}>
          <SheetTitle className="rp-sheet-title">
            {transfer.fromName} le paga a {transfer.toName}
          </SheetTitle>
          <SheetDescription className="rp-sheet-copy">
            {money(transfer.amountCents)}
          </SheetDescription>
        </SheetHeader>
        <div className="rp-sheet-body">
          {incoming ? (
            <>
              <p className="rp-sheet-copy">
                Confirma solo cuando el dinero aparezca en tu cuenta. Puedes
                registrar una parte.
              </p>
              <label className="rp-field">
                <span>Monto recibido</span>
                <input
                  inputMode="decimal"
                  placeholder={(transfer.amountCents / 100).toString()}
                  value={partial}
                  onChange={(event) =>
                    setPartial(event.target.value.replace(/[^\d.]/g, ''))
                  }
                />
              </label>
              {error ? <p className="rp-error">{error}</p> : null}
              <Button
                className="rp-primary"
                disabled={busy || partialCents > transfer.amountCents}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await onConfirm(
                      transfer,
                      partialCents > 0 ? partialCents : transfer.amountCents,
                    );
                  } catch (reason) {
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : 'No pudimos confirmarlo.',
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Check />{' '}
                {partialCents > 0 && partialCents < transfer.amountCents
                  ? 'Confirmar pago parcial'
                  : 'Confirmar que recibí'}
              </Button>
            </>
          ) : (
            <>
              {transfer.recipientClabe ? (
                <>
                  <div className="rp-clabe">
                    <span>{clabeFormat(transfer.recipientClabe)}</span>
                    {transfer.recipientBank ? (
                      <>
                        <br />
                        {transfer.recipientBank}
                      </>
                    ) : null}
                  </div>
                  <Button
                    className="rp-primary"
                    onClick={() =>
                      void onCopy(
                        `${transfer.recipientClabe}\n${money(transfer.amountCents)}\n${concept}`,
                        'CLABE, monto y concepto copiados',
                      )
                    }
                  >
                    <Copy /> Copiar datos para pagar
                  </Button>
                </>
              ) : (
                <div className="rp-card rp-empty">
                  {transfer.toName} todavía no comparte su CLABE.
                </div>
              )}
              <p className="rp-sheet-copy">
                ReParte no mueve dinero. La transferencia se hace directamente
                en tu banco.
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
