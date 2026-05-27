export default { title: 'Components/Callout' };

const callout = ({ type = 'info', title, body }) => `
  <aside class="callout callout--${type}" role="note">
    ${title ? `<p class="callout__title">${title}</p>` : ''}
    <div class="callout__body">${body}</div>
  </aside>
`;

export const Info = () => callout({ type: 'info', title: 'Kern van de norm',
  body: '<p>Een document moet vindbaar, beschikbaar en leesbaar zijn.</p>' });

export const Warning = () => callout({ type: 'warning', title: 'Let op',
  body: '<p>Deze norm is in concept.</p>' });

export const Success = () => callout({ type: 'success', title: 'Klaar',
  body: '<p>Norm is geaccepteerd.</p>' });

export const Danger = () => callout({ type: 'danger', title: 'Fout',
  body: '<p>De norm voldoet niet.</p>' });

export const WithoutTitle = () => callout({ type: 'info',
  body: '<p>Informatie zonder titel.</p>' });
