export default {
  title: 'Components/Card',
};

const card = ({ url = '#', title, variant, idLabel, excerpt }) => `
  <a href="${url}" class="card${variant ? ` card--${variant}` : ''}">
    ${idLabel ? `<span class="card__id">${idLabel}</span>` : ''}
    <h3 class="card__title">${title}</h3>
    ${excerpt ? `<p class="card__excerpt">${excerpt}</p>` : ''}
  </a>
`;

export const Default = () => card({ title: 'Standaard kaart', excerpt: 'Een korte beschrijving.' });

export const AccentBorder = () => card({
  title: 'Vindbaar',
  variant: 'accent-border',
  idLabel: 'Norm 6',
  excerpt: 'Een document moet binnen redelijke termijn vindbaar zijn.',
});

export const Subtle = () => card({ title: 'Subtle kaart', variant: 'subtle' });

export const Grid = () => `
  <div class="card-grid">
    ${card({ title: 'A', variant: 'accent-border', idLabel: 'Norm 1' })}
    ${card({ title: 'B', variant: 'accent-border', idLabel: 'Norm 2' })}
    ${card({ title: 'C', variant: 'accent-border', idLabel: 'Norm 3' })}
  </div>
`;
