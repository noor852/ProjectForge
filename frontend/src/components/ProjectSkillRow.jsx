function ProjectSkillRow(props) {
  return (
    <div className="project-skill-row">
      <input
        placeholder="Skill (e.g. react)"
        value={props.skill.name}
        onChange={function (e) {
          props.onChange(props.index, "name", e.target.value);
        }}
      />
      <select
        value={props.skill.importance}
        onChange={function (e) {
          props.onChange(props.index, "importance", e.target.value);
        }}
      >
        <option value="essential">Essential</option>
        <option value="secondary">Secondary</option>
      </select>
      <select
        value={props.skill.minLevel}
        onChange={function (e) {
          props.onChange(props.index, "minLevel", Number(e.target.value));
        }}
      >
        {[1, 2, 3, 4, 5].map(function (n) {
          return <option key={n} value={n}>Min level {n}</option>;
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

export default ProjectSkillRow;