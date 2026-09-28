export function Icon({ name, size = 20, ...props }) {
  const paths = {
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5" />
      </>
    ),
    signal: (
      <>
        <path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0" />
        <circle cx="12" cy="20" r=".5" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    chip: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
        <rect x="9" y="9" width="6" height="6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H5v20h14V7l-5-5Z" />
        <path d="M14 2v6h5M8 13h8m-8 4h5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    logout: (
      <>
        <path d="M9 4H4v16h5m0-8h12m-4-4 4 4-4 4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function Brand() {
  return (
    <span className="brand">
      <svg
        className="brand-mark"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
      >
        <rect width="34" height="34" rx="10" fill="currentColor" />
        <path
          d="M10 23V11l14 12V11"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="10" r="2" fill="#7fe7ff" />
      </svg>
      <span>Nexus</span>
    </span>
  );
}
