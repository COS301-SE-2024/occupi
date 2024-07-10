import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

import { configure } from '@testing-library/react';
configure({ testIdAttribute: 'data-testid' });
