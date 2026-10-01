'use client';

import Link from 'next/link';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReParteLogo } from '@/components/reparte-logo';
import { registerWebMcpTool } from '@/lib/webmcp';

type RecentEvent = {
  slug: string;
  name: string;
  status: 'open' | 'closed';
  updated_at: string;
};

async function readError(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  return data.error || 'No pudimos completar la acción.';
}

async function createEventRequest(name: string, personName: string) {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, personName }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as { slug: string };
}

export function ReParteHome() {
  const [eventName, setEventName] = useState('');
  const [personName, setPersonName] = useState('');
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/events', { cache: 'no-store' })
      .then(
        async (response): Promise<{ events?: RecentEvent[] }> =>
          response.ok
            ? ((await response.json()) as { events?: RecentEvent[] })
            : { events: [] },
      )
      .then((data) => setEvents(data.events ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(
    () =>
      registerWebMcpTool({
        name: 'create_event',
        title: 'Crear evento en ReParte',
        description:
          'Crea un evento compartido de gastos, convierte a la persona indicada en organizadora y abre el evento.',
        inputSchema: {
          type: 'object',
          properties: {
            eventName: {
              type: 'string',
              minLength: 1,
              maxLength: 40,
              description: 'Nombre del viaje, casa o evento.',
            },
            personName: {
              type: 'string',
              minLength: 1,
              maxLength: 40,
              description: 'Nombre de quien organiza.',
            },
          },
          required: ['eventName', 'personName'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          if (!input || typeof input !== 'object')
            throw new Error('Faltan los datos del evento.');
          const values = input as Record<string, unknown>;
          if (
            typeof values.eventName !== 'string' ||
            typeof values.personName !== 'string'
          ) {
            throw new Error('El evento y la persona deben tener nombre.');
          }
          const data = await createEventRequest(
            values.eventName,
            values.personName,
          );
          const url = `${window.location.origin}/e/${data.slug}`;
          window.location.assign(url);
          return { slug: data.slug, url };
        },
      }),
    [],
  );

  async function createEvent(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await createEventRequest(eventName, personName);
      window.location.assign(`/e/${data.slug}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No pudimos crear el evento.',
      );
      setBusy(false);
    }
  }

  return (
    <main className="rp-shell">
      <header className="rp-topbar">
        <ReParteLogo />
      </header>
      <section className="rp-content rp-home">
        <p className="rp-eyebrow">Un gasto compartido tiene principio y fin</p>
        <h1>¿Qué van a repartir?</h1>
        <p className="rp-lede">
          Crea el evento y manda el link. Nadie baja una app ni abre una cuenta.
        </p>

        <form className="rp-create-card" onSubmit={createEvent}>
          <label className="rp-field">
            <span>Nombre del evento</span>
            <input
              maxLength={40}
              placeholder="Las Vegas · octubre"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
            />
          </label>
          <label className="rp-field">
            <span>Tu nombre</span>
            <input
              autoComplete="name"
              maxLength={40}
              placeholder="¿Cómo te llamas?"
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
            />
          </label>
          {error ? (
            <p className="rp-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="rp-primary"
            disabled={busy || !eventName.trim() || !personName.trim()}
            type="submit"
          >
            <Plus /> {busy ? 'Creando…' : 'Crear evento'}
          </Button>
        </form>

        {events.length ? (
          <section className="rp-recents" aria-labelledby="recent-title">
            <h2 id="recent-title">Tus eventos en este dispositivo</h2>
            <div className="rp-list">
              {events.map((event) => (
                <Link
                  className="rp-row"
                  href={`/e/${event.slug}`}
                  key={event.slug}
                >
                  <span className="rp-avatar">
                    {event.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="rp-row-copy">
                    <strong>{event.name}</strong>
                    <small>
                      {event.status === 'open' ? 'Abierto' : 'Cerrado'}
                    </small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
      <footer className="rp-home-note">
        Tus eventos se guardan en una base compartida; el link ya no lleva una
        copia.
      </footer>
    </main>
  );
}
