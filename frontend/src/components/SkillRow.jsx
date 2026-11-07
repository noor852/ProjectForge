function SkillRow(props) {
  return (
    <div className="skill-row">
      <input
        placeholder="Skill (e.g. react)"
        value={props.skill.name}
        onChange={function (e) {
          props.onChange(props.index, "name", e.target.value);
        }}
      />
      <select
        value={props.skill.level}
        onChange={function (e) {
          props.onChange(props.index, "level", Number(e.target.value));
        }}
      >
        {[1, 2, 3, 4, 5].map(function (n) {
          return <option key={n} value={n}>{n}</option>;
        })}
      </select>
      <button
        type="button"
        className="btn-danger"
        onClick={function () {
          props.onRemove(props.index);
        }}
      >
        Remove
      </button>
    </div>
  );
}

export default SkillRow;