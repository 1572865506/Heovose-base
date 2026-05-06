import os

file_path = '/home/anthony/projects/Heovose-base/src/app/admin/home/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = -1
end_line = -1

for i, line in enumerate(lines):
    if '<DndContext' in line and i > 900:
        start_line = i
    if '<div className="p-6 rounded-[2.5rem] bg-amber-50/50' in line and i > 1000:
        end_line = i
        break

if start_line != -1 and end_line != -1:
    print(f"Found area: {start_line} to {end_line}")
    
    clean_bento_grid = """            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={bentoItems?.map((i: any) => i.id) || []}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {bentoItems?.map((item: any) => (
                    <SortableBentoItem 
                      key={item.id} 
                      item={item} 
                      onEdit={() => setBentoDialog({ open: true, item })}
                      onDelete={async () => {
                        if(confirm('确定删除此格位吗？')) {
                          await fetch(`/api/bentoItems/${item.id}`, { method: 'DELETE' });
                          mutateBentoItems();
                          toast({ title: "已删除格位" });
                        }
                      }}
                    />
                  ))}

                  {(!bentoItems || bentoItems.length === 0) && (
                    <div className="col-span-full py-20 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem]">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">暂无独立格位，请点击右上方添加</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>\n"""
    
    new_lines = lines[:start_line] + [clean_bento_grid] + lines[end_line:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully repaired the file.")
else:
    print(f"Failed to find anchors. Start: {start_line}, End: {end_line}")
