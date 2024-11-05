let reportList = [];
let reports = [];
let reversed = false;
let order_by = "idx";
const order_index = ["idx", "date", "status"];

function setLink2Image() {
  Array.from(document.querySelectorAll("tr.report td:nth-child(1)")).forEach(
    (ele) => {
      ele.addEventListener("click", (e) => {
        const uuid = e.target.parentNode.id;
        console.log(e.target.addEventListener);
        location.href = `/detect/${uuid}${e.target.id}`; // uuid+ext
      });
    }
  );
}

async function refreshData() {
  let idx = 0;
  reportList = [];
  reports = await getList();
  reports.forEach((report) => {
    const { id, authorId, date, type, status, description, image, location } =
      report;
    const ext = image
      .substring(image.lastIndexOf("."), image.length)
      .toLowerCase();
    const report_div = addReport(
      id,
      ++idx,
      date,
      type,
      status,
      status == 4,
      location,
      ext
    );
    reportList.push([idx, date, status, report_div]);
  });
}
function refreshDisplay(tbody, sortIdx = 0, reverse) {
  tbody.innerHTML = "";

  reportList.sort((a, b) => a[sortIdx] - b[sortIdx]);
  if (reverse) reportList.reverse();

  reportList.forEach((report) => {
    const ele = report[report.length - 1];
    const query = new URLSearchParams(location.search).get("query");
    if (!query || ele.innerText.includes(query)) {
      tbody.appendChild(ele);
    }
  });
  Array.from(document.querySelectorAll("div.status")).forEach((stat) => {
    stat.addEventListener("click", (e) => {
      e.preventDefault();
      const status_num =
        Array.prototype.indexOf.call(e.target.parentNode.children, e.target) +
        1;
      const uuid = e.target.parentNode.parentNode.parentNode.id;

      if (window.prompt("변경하시려면 true를 입력하세요", "false") == "true") {
        changeStatus(tbody, uuid, status_num);
        return;
      }
    });
  });
  setLink2Image();
}
const changeStatus = (tbody, uuid, status) => {
  fetch("/api/v0/report/changeStatus", {
    method: "POST",
    body: JSON.stringify({
      id: uuid,
      status_num: status,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.text())
    .then(async (res) => {
      await refreshData();
      refreshDisplay(tbody, 0, false);
    });
};

function addReport(id, idx, date, type, status, solved, locate, ext) {
  const template = `<td id=${ext}>${idx}</td>
<td>${date.split("T")[0]}</td>
<td>
    ${type}
</td>
<td>
    <div class="report-status-box">
        <div class="status status-received ${
          status == 1 ? "now" : ""
        }">접수</div>
        <div class="status status-reported ${
          status == 2 ? "now" : ""
        }">신고</div>
        <div class="status status-pending ${
          status == 3 ? "now" : ""
        }">대기</div>
        <div class="status status-completed ${
          status == 4 ? "now" : ""
        }">완료</div>
    </div>

</td>
<td class="solved">${solved ? "✅" : "❌"}</td>
<td>${locate}</td>`;
  const tr = document.createElement("tr");
  tr.classList.add("report");
  tr.innerHTML = template;
  tr.id = id;

  return tr;
}

window.onload = async () => {
  const $ = document;

  const search_input = $.getElementById("search_input");
  search_input.addEventListener("keypress", (e) => {
    if (e.code == "Enter") {
      location.search = `query=${e.target.value}`;
    }
  });

  const tbody = $.querySelector("#report-table > tbody");

  await refreshData();
  refreshDisplay(tbody, 0, false);

  Array.from(document.querySelectorAll(".sort-by-idx")).forEach((sortBtn) => {
    sortBtn.addEventListener("click", (e) => {
      if (order_by == "idx") {
        reversed = !reversed;
      } else {
        reversed = false;
        order_by = "idx";
      }

      refreshDisplay(tbody, order_index.indexOf(order_by), reversed);
    });
  });
  Array.from(document.querySelectorAll(".sort-by-date")).forEach((sortBtn) => {
    sortBtn.addEventListener("click", (e) => {
      if (order_by == "date") {
        reversed = !reversed;
      } else {
        reversed = false;
        order_by = "date";
      }

      refreshDisplay(tbody, order_index.indexOf(order_by), reversed);
    });
  });
  Array.from(document.querySelectorAll(".sort-by-status")).forEach(
    (sortBtn) => {
      sortBtn.addEventListener("click", (e) => {
        if (order_by == "status") {
          reversed = !reversed;
        } else {
          reversed = false;
          order_by = "status";
        }

        refreshDisplay(tbody, order_index.indexOf(order_by), reversed);
      });
    }
  );
};

async function getList() {
  const data = await (await fetch("/api/v0/report/list")).json();
  if (data.err) throw Error(data.err);

  return Array(...data.result);
}
