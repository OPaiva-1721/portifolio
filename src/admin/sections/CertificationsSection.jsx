import StringListEditor from '../fields/StringListEditor.jsx';

export default function CertificationsSection({ value, onChange }) {
  return (
    <div className="admin-section">
      <StringListEditor label="Certificações" items={value} onChange={onChange} />
    </div>
  );
}
