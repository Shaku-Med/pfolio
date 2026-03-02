(function () {
  "use strict";

  const API_BASE = "";

  async function api(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const r = await fetch(API_BASE + path, opts);
    const text = await r.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {}
    if (!r.ok) throw new Error(data?.error || r.statusText || "Request failed");
    return data;
  }

  function normalizeTags(val) {
    if (!val) return [];
    if (typeof val === "string") {
      return val.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
    }
    if (Array.isArray(val)) {
      return val.map(function (x) { return String(x).trim(); }).filter(function (s) { return s.length > 0; });
    }
    return [];
  }

  function normalizeLinks(val) {
    if (!Array.isArray(val)) return [];
    return val.filter(function (item) {
      return item && typeof item === "object" && (item.label || "").trim() && (item.url || "").trim();
    }).map(function (item) {
      return { label: String(item.label).trim(), url: String(item.url).trim(), icon: item.icon };
    });
  }

  function showMessage(container, type, text) {
    const id = "msg-" + Date.now();
    const div = document.createElement("div");
    div.className = "message " + type;
    div.id = id;
    div.textContent = text;
    container.prepend(div);
    setTimeout(() => div.remove(), 4000);
  }

  const appEl = document.getElementById("app");
  const sectionTitle = document.getElementById("section-title");
  const content = document.getElementById("content");

  function setActiveNav(section) {
    document.querySelectorAll(".sidebar-nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.section === section);
    });
  }

  function navigate(section) {
    setActiveNav(section);
    const titles = { projects: "Projects", experience: "Experience", stack: "Stack", blog: "Blog", resume: "Resume" };
    sectionTitle.textContent = titles[section] || section;
    if (section === "resume") renderResume();
    else renderList(section);
  }

  if (appEl && content) {
    document.querySelectorAll(".sidebar-nav a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(a.dataset.section);
      });
    });
    navigate("projects");
  }

  // --- List + CRUD ---
  function renderList(section) {
    content.innerHTML = '<div class="loading">Loading…</div>';
    api("GET", "/api/" + section)
      .then((res) => {
        const items = res.data || [];
        const idKey = "id";
        const columns = columnConfig(section);
        let html = "";
        if (columns.addForm) {
          html += '<div class="form-section mb-1"><h3>Add new</h3>' + columns.addForm + "</div>";
        }
        if (items.length === 0) {
          html += '<div class="empty-state">No items yet.</div>';
        } else {
          html += '<div class="table-wrap"><table><thead><tr>';
          columns.heads.forEach((h) => (html += "<th>" + escapeHtml(h.label) + "</th>"));
          html += "<th></th></tr></thead><tbody>";
          items.forEach((row) => {
            html += "<tr>";
            columns.heads.forEach((h) => (html += "<td>" + escapeHtml(formatCell(row[h.key])) + "</td>"));
            html += '<td><button type="button" class="btn btn-ghost btn-sm edit-btn" data-id="' + escapeHtml(row[idKey]) + '">Edit</button> ';
            html += '<button type="button" class="btn btn-danger btn-sm delete-btn" data-id="' + escapeHtml(row[idKey]) + '">Delete</button></td></tr>';
          });
          html += "</tbody></table></div>";
        }
        content.innerHTML = html;
        bindListEvents(section, columns);
      })
      .catch((err) => {
        content.innerHTML = '<div class="message error">' + escapeHtml(err.message) + "</div>";
      });
  }

  function formatCell(v) {
    if (v == null) return "";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  function escapeHtml(s) {
    if (s == null) return "";
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function columnConfig(section) {
    const configs = {
      projects: {
        heads: [{ key: "id", label: "ID" }, { key: "title", label: "Title" }, { key: "category", label: "Category" }],
        addForm: addFormProjects(),
      },
      experience: {
        heads: [{ key: "id", label: "ID" }, { key: "title", label: "Title" }, { key: "company", label: "Company" }],
        addForm: addFormExperience(),
      },
      stack: {
        heads: [{ key: "id", label: "ID" }, { key: "category", label: "Category" }, { key: "tools", label: "Tools" }],
        addForm: addFormStack(),
      },
      gallery: {
        heads: [{ key: "id", label: "ID" }, { key: "title", label: "Title" }, { key: "tone", label: "Tone" }],
        addForm: addFormGallery(),
      },
      blog: {
        heads: [{ key: "id", label: "ID" }, { key: "title", label: "Title" }, { key: "date", label: "Date" }],
        addForm: addFormBlog(),
      },
    };
    return configs[section] || { heads: [], addForm: "" };
  }

  function addFormProjects() {
    return (
      '<div class="form-row"><label>Title</label><input name="title" type="text" required></div>' +
      '<div class="form-row"><label>Category</label><input name="category" type="text"></div>' +
      '<div class="form-row"><label>Description</label><textarea name="description"></textarea></div>' +
      '<div class="form-row"><label>Tags (comma-separated)</label><input name="tags" type="text" placeholder="a, b, c"></div>' +
      '<div class="form-row"><label>Image path</label><input name="image_path" type="text" placeholder="Local path (e.g. C:\\Users\\...\\image.png)"></div>' +
      '<div class="form-row"><label>Image alt text</label><input name="image_alt" type="text" placeholder="Short description for accessibility"></div>' +
      '<div class="form-row"><label>GitHub URL</label><input name="github_url" type="url" placeholder="https://github.com/..."></div>' +
      '<div class="form-row"><label>Live URL</label><input name="live_url" type="url" placeholder="https://..."></div>' +
      '<div class="form-row"><label>Links (JSON array)</label><textarea name="links" placeholder=\'[{"label":"Demo","url":"https://..."}]\'></textarea></div>' +
      '<div class="form-row"><label>More details (markdown)</label><textarea name="details_md" placeholder="Optional markdown for the project detail page"></textarea></div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary submit-add">Add project</button></div>'
    );
  }

  function addFormExperience() {
    return (
      '<div class="form-row"><label>Title</label><input name="title" type="text" required></div>' +
      '<div class="form-row"><label>Company</label><input name="company" type="text"></div>' +
      '<div class="form-row"><label>Role</label><input name="role" type="text"></div>' +
      '<div class="form-row"><label>Period from</label><input name="period_from" type="text" placeholder="2021-01"></div>' +
      '<div class="form-row"><label>Period to</label><input name="period_to" type="text" placeholder="Present"></div>' +
      '<div class="form-row"><label>Description</label><textarea name="description"></textarea></div>' +
      '<div class="form-row"><label>More details (markdown)</label><textarea name="details_md" placeholder="Optional markdown for the experience detail page"></textarea></div>' +
      '<div class="form-row"><label>Logo path</label><input name="logo_path" type="text" placeholder="Local path (e.g. C:\\Users\\...\\logo.png)"></div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary submit-add">Add experience</button></div>'
    );
  }

  function addFormStack() {
    return (
      '<div class="form-row"><label>Category</label><input name="category" type="text" required></div>' +
      '<div class="form-row"><label>Tools</label><input name="tools" type="text" required></div>' +
      '<div class="form-row"><label>Description</label><textarea name="description"></textarea></div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary submit-add">Add stack</button></div>'
    );
  }

  function addFormGallery() {
    return (
      '<div class="form-row"><label>Title</label><input name="title" type="text" required></div>' +
      '<div class="form-row"><label>Subtitle</label><input name="subtitle" type="text"></div>' +
      '<div class="form-row"><label>Tone</label><input name="tone" type="text" placeholder="dark or light"></div>' +
      '<div class="form-row"><label>More details (markdown)</label><textarea name="details_md" placeholder="Optional markdown for the gallery detail page"></textarea></div>' +
      '<div class="form-row"><label>Primary image path</label><input name="src_path" type="text" placeholder="Local path (e.g. C:\\Users\\...\\image.png)"></div>' +
      '<div class="form-row"><label><input type="checkbox" name="use_dir_for_project_srcs"> Use directory for extra images</label></div>' +
      '<div class="form-row"><label>Extra images directory</label><input name="project_srcs_dir" type="text" placeholder="Folder with images"></div>' +
      '<div class="form-row"><label>Single extra image path</label><input name="project_srcs_path" type="text" placeholder="Optional single image path"></div>' +
      '<p class="text-xs text-muted">Warning: Check the directory before importing to ensure it does not contain sensitive images.</p>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary submit-add">Add gallery item</button></div>'
    );
  }

  function addFormBlog() {
    return (
      '<div class="form-row"><label>Slug</label><input name="slug" type="text" required></div>' +
      '<div class="form-row"><label>Title</label><input name="title" type="text" required></div>' +
      '<div class="form-row"><label>Category</label><input name="category" type="text"></div>' +
      '<div class="form-row"><label>Cover image path</label><input name="cover_image_path" type="text" placeholder="Local path (e.g. C:\\Users\\...\\cover.png)"></div>' +
      '<div class="form-row"><label>Date (YYYY-MM-DD)</label><input name="date" type="text"></div>' +
      '<div class="form-row"><label>Excerpt</label><textarea name="excerpt"></textarea></div>' +
      '<div class="form-row"><label>Body</label><textarea name="body"></textarea></div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary submit-add">Add post</button></div>'
    );
  }

  function bindListEvents(section, columns) {
    const form = content.querySelector(".form-section");
    if (form) {
      form.querySelector(".submit-add")?.addEventListener("click", () => submitAdd(section, form));
    }
    content.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        editItem(section, id);
      });
    });
    content.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("Delete this item?")) deleteItem(section, id);
      });
    });
  }

  function submitAdd(section, form) {
    const inputs = form.querySelectorAll("input, textarea");
    const body = {};
    inputs.forEach((el) => {
      const v = el.value.trim();
      const name = el.name;
      if (name === "tags") body.tags = normalizeTags(v ? v.split(",") : []);
      else if (name === "period_from") (body.period = body.period || {}).from = v;
      else if (name === "period_to") (body.period = body.period || {}).to = v;
      else if (name === "links") {
        try { body.links = normalizeLinks(v ? JSON.parse(v) : []); } catch (_) { body.links = []; }
      } else if (name === "date" && section === "blog") body[name] = v || null;
      else if (name === "read_time" && section === "blog") body[name] = v || null;
      else if (name === "cover_image" && section === "blog") body[name] = v || null;
      else if (name === "cover_image_path" && section === "blog") body[name] = v || null;
      else if (name === "use_dir_for_project_srcs" && section === "gallery") {
        body[name] = el.checked;
      } else if (v) body[name] = v;
    });
    if (section === "experience" && body.period) body.period = { from: body.period.from || "", to: body.period.to || "" };
    api("POST", "/api/" + section, body)
      .then(() => {
        showMessage(content, "success", "Added.");
        renderList(section);
      })
      .catch((err) => showMessage(content, "error", err.message));
  }

  function editItem(section, id) {
    content.innerHTML = '<div class="loading">Loading…</div>';
    api("GET", "/api/" + section).then((res) => {
      const item = (res.data || []).find((r) => r.id === id);
      if (!item) {
        content.innerHTML = '<div class="message error">Not found.</div>';
        return;
      }
      const fields = editFieldsFor(section, item);
      let html = '<div class="form-section"><h3>Edit</h3>' + fields + '<div class="form-actions mt-1"><button type="button" class="btn btn-primary save-edit">Save</button> <a href="#" class="btn btn-ghost cancel-edit">Cancel</a></div></div>';
      content.innerHTML = html;
      content.querySelector(".save-edit").addEventListener("click", () => {
        const form = content.querySelector(".form-section");
        const body = gatherEditBody(section, form);
        api("PUT", "/api/" + section + "/" + id, body)
          .then(() => {
            showMessage(content, "success", "Saved.");
            renderList(section);
          })
          .catch((err) => showMessage(content, "error", err.message));
      });
      content.querySelector(".cancel-edit").addEventListener("click", (e) => {
        e.preventDefault();
        renderList(section);
      });
    });
  }

  function editFieldsFor(section, item) {
    const row = (name, label, value) =>
      '<div class="form-row"><label>' + label + "</label><input name=\"" + name + "\" type=\"text\" value=\"" + escapeHtml(String(value ?? "")) + "\"></div>";
    const rowArea = (name, label, value) =>
      '<div class="form-row"><label>' + label + "</label><textarea name=\"" + name + "\">" + escapeHtml(String(value ?? "")) + "</textarea></div>";
    if (section === "projects") {
      const linksVal = Array.isArray(item.links) ? JSON.stringify(item.links, null, 2) : (item.links ? String(item.links) : "[]");
      return (
        row("title", "Title", item.title) +
        row("category", "Category", item.category) +
        rowArea("description", "Description", item.description) +
        row("tags", "Tags", Array.isArray(item.tags) ? item.tags.join(", ") : item.tags) +
        row("image_alt", "Image alt", item.image_alt) +
        row("github_url", "GitHub URL", item.github_url) +
        row("live_url", "Live URL", item.live_url) +
        rowArea("links", "Links (JSON array)", linksVal) +
        rowArea("details_md", "More details (markdown)", item.details_md)
      );
    }
    if (section === "experience") {
      const p = item.period || {};
      return (
        row("title", "Title", item.title) +
        row("company", "Company", item.company) +
        row("role", "Role", item.role) +
        row("period_from", "Period from", p.from) +
        row("period_to", "Period to", p.to) +
        rowArea("description", "Description", item.description) +
        row("highlights", "Highlights (comma)", Array.isArray(item.highlights) ? item.highlights.join(", ") : "") +
        row("tags", "Tags (comma)", Array.isArray(item.tags) ? item.tags.join(", ") : "") +
        row("development_summary", "Development summary", item.development_summary) +
        row("challenges", "Challenges (comma)", Array.isArray(item.challenges) ? item.challenges.join(", ") : "") +
        row("learnings", "Learnings (comma)", Array.isArray(item.learnings) ? item.learnings.join(", ") : "") +
        rowArea("details_md", "More details (markdown)", item.details_md)
      );
    }
    if (section === "stack") {
      return row("category", "Category", item.category) + row("tools", "Tools", item.tools) + rowArea("description", "Description", item.description);
    }
    if (section === "gallery") {
      const srcs = Array.isArray(item.project_srcs) ? JSON.stringify(item.project_srcs, null, 2) : (item.project_srcs ? String(item.project_srcs) : "[]");
      return (
        row("title", "Title", item.title) +
        row("subtitle", "Subtitle", item.subtitle) +
        row("src", "Primary image src", item.src) +
        row("tone", "Tone", item.tone) +
        rowArea("details_md", "More details (markdown)", item.details_md) +
        rowArea("project_srcs", "Project srcs (JSON array)", srcs) +
        row("project_srcs_dir", "Extra images directory (optional, for re-import)", "") +
        row("project_srcs_path", "Single extra image path (optional)", "")
      );
    }
    if (section === "blog") {
      return (
        row("slug", "Slug", item.slug) +
        row("title", "Title", item.title) +
        row("category", "Category", item.category) +
        row("date", "Date", item.date) +
        row("read_time", "Read time", item.read_time) +
        row("tags", "Tags (comma)", Array.isArray(item.tags) ? item.tags.join(", ") : "") +
        row("cover_image", "Cover image URL (https only; for local file use path below)", item.cover_image) +
        row("cover_image_path", "Cover image path (local file to upload)", "") +
        rowArea("excerpt", "Excerpt", item.excerpt) +
        rowArea("body", "Body", item.body)
      );
    }
    return "";
  }

  function gatherEditBody(section, form) {
    const body = {};
    const listFields = { tags: true, highlights: true, challenges: true, learnings: true };
    form.querySelectorAll("input, textarea").forEach((el) => {
      const name = el.name;
      const v = el.value.trim();
      if (name === "period_from") (body.period = body.period || {}).from = v;
      else if (name === "period_to") (body.period = body.period || {}).to = v;
      else if (listFields[name]) body[name] = normalizeTags(v ? v.split(",") : []);
      else if (section === "projects" && name === "links") {
        try { body.links = normalizeLinks(v ? JSON.parse(v) : []); } catch (_) { body.links = []; }
      } else if ((name === "date" || name === "read_time" || name === "cover_image" || name === "cover_image_path") && section === "blog") {
        body[name] = v || null;
      } else if (section === "gallery" && name === "project_srcs") {
        try { body.project_srcs = v ? JSON.parse(v) : []; } catch (_) { body.project_srcs = []; }
      } else if (section === "gallery" && (name === "project_srcs_dir" || name === "project_srcs_path")) {
        if (v) body[name] = v;
      } else body[name] = v;
    });
    if (section === "experience" && body.period) body.period = { from: body.period.from || "", to: body.period.to || "" };
    return body;
  }

  function deleteItem(section, id) {
    api("DELETE", "/api/" + section + "/" + id)
      .then(() => {
        showMessage(content, "success", "Deleted.");
        renderList(section);
      })
      .catch((err) => showMessage(content, "error", err.message));
  }

  // --- Resume ---
  function renderResume() {
    content.innerHTML =
      '<div class="form-section">' +
      "<h3>Resume markdown</h3>" +
      "<p class=\"text-muted\" style=\"margin-bottom:1rem;\">Paste markdown below and click Save to update the resume in the database.</p>" +
      '<div class="form-row"><label>Body (markdown)</label><textarea id="resume-body" class="resume-section" placeholder="Paste or type markdown…"></textarea></div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary" id="resume-save">Save resume</button></div>' +
      "</div>";
    content.querySelector("#resume-save").addEventListener("click", saveResume);
  }

  function saveResume() {
    const ta = document.getElementById("resume-body");
    const bodyMd = ta?.value?.trim() || "";
    if (!bodyMd) {
      showMessage(content, "error", "Enter some markdown.");
      return;
    }
    api("POST", "/api/resume", { body_md: bodyMd })
      .then(() => showMessage(content, "success", "Resume saved."))
      .catch((err) => showMessage(content, "error", err.message));
  }

})();
